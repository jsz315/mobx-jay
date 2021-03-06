import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Video, Image, Ad, Audio } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import './index.less'
import AudioView from '../../components/audio_view'
import VideoView from '../../components/video_view'
import PkStatusView from '../../components/pk_status_view'
import UpdateView from '../../components/update_view'
import PkOverView from '../../components/pk_over_view'
import PageView from '../../components/page_view'
import PkAnswerView from '../../components/pk_answer_view'
import LoginView from '../../components/login_view'
import QuestionView from '../../components/question_view'
import PkQuitView from '../../components/pk_quit_view'
import ShareView from '../../components/share_view'
import AdView from '../../components/ad_view'
import global from '../../core/global'
import ai from "../../core/ai";
import client from "../../core/taroSocket";
import Message from "../../core/message";
import pagePath from '../../core/pagePath'

let right = 0;
let innerAudioContext = null;
let rightSound = null;
let wrongSound = null;
let timerId;

@inject('questionStore')
@observer
class PkQuestionPage extends Component {

  constructor(props){
    super(props)
    this.state = {
      showAnswer: false,
      isRight: false,
      isSelf: false,
      clickId: -1,
      action: 1
    }
  }

  config = {
    navigationBarTitleText: '答题页面'
  }

  async componentWillMount () {
    const { questionStore } = this.props
    questionStore.changeIsPk(true);
    questionStore.initPkData();
  }
  
  componentWillReact () {
    //console.log('componentWillReact')
  }

  componentDidMount () {
    const { questionStore } = this.props
    client.on(Message.TYPE_CHOOSE_ANSWER, data => {
      this.serveChoose(data);
    })

    client.on(Message.TYPE_QUIT, data => {
      console.log(data, '退出')
      console.log(data.nickName, '退出');
      questionStore.changePopQuit(true);
    })

    clearTimeout(timerId);
    timerId = setTimeout(ai.choose, Math.floor(Math.random() * 10 + 4) * 1000);
  }
  
  componentWillUnmount () {
    client.disconnect();
  }

  componentDidShow () {
    pagePath.push("pk_question");
    console.log(pagePath.path, "page path");
  }

  componentDidHide () { }

  onShareAppMessage (option) {
    // option.from === 'button'
    return global.shareData
  }

  choose = (index, level) => {
    const { questionStore } = this.props
    if(ai.getRunning()){
      var res = {
        data: {
          index: index
        },
        player: {
          openid: questionStore.openid
        }
      }
      this.serveChoose(res);
    }
    else{
      client.send(Message.TYPE_CHOOSE_ANSWER, {
        index, level
      });
    }
  }

  serveChoose(res){
    clearTimeout(timerId);
    
    console.log("serveChoose", res);
    var index = res.data.index;

    const { questionStore } = this.props
    const obj = questionStore.getCurQuestion();

    var isRight = obj.right == index + 1;
    var isSelf = res.player.openid == questionStore.openid;

    this.setState({
      showAnswer: true,
      isRight: isRight,
      isSelf: isSelf
    })

    this.refs.question.showChoose(index);

    if(isRight){
      if(isSelf){
        questionStore.doRight()
        questionStore.addScore(1)
        this.refs.question.playRightSound()
      }
      else{
        questionStore.doWrong()
        questionStore.addScore(1, true)
        this.refs.question.playWrongSound()
      }
    }
    else{
      if(isSelf){
        questionStore.doWrong()
        questionStore.addScore(1, true)
        this.refs.question.playWrongSound()
      }
      else{
        questionStore.doRight()
        questionStore.addScore(1)
        this.refs.question.playRightSound()
      }
    }
    
    setTimeout(()=>{
      this.setState({
        showAnswer: false,
      })

      if(questionStore.checkOver()){
        console.log("over");
        questionStore.gameOver();
        this.refs.question.playResultSound();

        client.disconnect();
        ai.setRunning(false);
        let other = questionStore.others[0];
        if(other.score > questionStore.score){
          this.refs.question.playLoseSound()
        }
        else{
          this.refs.question.playWinSound()
        }
      }
      else{
        this.refs.question.next();
        timerId = setTimeout(ai.choose, Math.floor(Math.random() * 8 + 4) * 1000);
      }
    }, 2000)
  }
  
  render () {
    const { questionStore } = this.props

    let answerView = null;
    if(this.state.showAnswer){
      answerView = <PkAnswerView isRight={this.state.isRight} isSelf={this.state.isSelf} questionStore={questionStore}></PkAnswerView>
    }
    else{
      answerView = <View></View>
    }

    return (
      <PageView>
        <View className='pk-question-page'>
          <PkStatusView questionStore={questionStore}></PkStatusView>
          <QuestionView choose={this.choose.bind(this)} ref='question'></QuestionView>
          {answerView}
        </View>
        {
          questionStore.popOver && <PkOverView questionStore={questionStore}></PkOverView>
        }
        {
          questionStore.popQuit && <PkQuitView questionStore={questionStore}></PkQuitView>
        }
      </PageView>
    )
  }
}

export default PkQuestionPage
