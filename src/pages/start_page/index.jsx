import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Video, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import './index.less'
import AudioView from '../../components/audio_view'
import VideoView from '../../components/video_view'
import ShareView from '../../components/share_view'
import PageView from '../../components/page_view'
import scope from '../../utils/scope'
import global from '../../core/global'
import ai from "../../core/ai";
import client from "../../core/taroSocket";
import pagePath from '../../core/pagePath'

@inject('questionStore')
@observer
class StartPage extends Component {

  constructor(props){
    super(props)
    this.state = {
      showUserBtn: false
    }
  }

  config = {
    navigationBarTitleText: '开始页面'
  }

  async componentWillMount () {

  }

  async initData(){
    const { questionStore } = this.props
    let openid = questionStore.openid;
    if(!openid){
      //console.log('scope.login')
      let loginRes = await scope.login();
      if(loginRes){
        let getOpenidRes = await global.getOpenid(loginRes.code);
        openid = getOpenidRes.data.openid;
        //console.log('openid = ' + openid);
        questionStore.changeOpenid(openid);
      }
    }
    console.log('openid = ' + openid);

    await questionStore.initAsync();
  }

  // saveUser(userInfo){
  //   const { questionStore } = this.props
  //   questionStore.changeNickName(userInfo.nickName);
  //   questionStore.changeAvatarUrl(userInfo.avatarUrl);
  //   questionStore.changeGender(userInfo.gender);

  //   global.setUser({
  //     openid: questionStore.openid,
  //     avatarUrl: questionStore.avatarUrl,
  //     nickName: questionStore.nickName,
  //     gender: questionStore.gender,
  //     city: questionStore.city,
  //     province: questionStore.province,
  //     platform: global.platform
  //   });
  // }

  componentWillReact () {
    //console.log('componentWillReact')
  }

  componentDidMount () {
    console.log('start componentDidMount', this)
    this.initData();
  }

  componentWillUnmount () { 
    console.log('start componentWillUnmount', this)
  }

  componentDidShow () {
    pagePath.push("start");
    console.log(pagePath.path, "page path");
    client.disconnect();
    ai.setRunning(false);
  }

  componentDidHide () {
    console.log('start componentDidHide', this)
  }

  onShareAppMessage (option) {
    // option.from === 'button'
    return global.shareData
  }

  onConfirm = (e) => {
    //console.log(e.detail.value)
  }

  jump = (n, e) => {
    const { questionStore } = this.props
    if(n == 1){
      questionStore.reset();
      Taro.navigateTo({
        url: '/pages/question_page/index'
      })
    }
    else if(n == 2){
      questionStore.reset();
      Taro.navigateTo({
        url: '/pages/wait_page/index'
      })

      // Taro.navigateTo({
      //   url: '/pages/pk_question_page/index'
      // })
    }
    else{
       Taro.navigateTo({
        url: '/pages/rank_page/index'
      })
    }
   
  }


  bindContact (e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  }

  render () {
    const { questionStore } = this.props

    return (
      <PageView>
        <View className='start-page'>
          <View className='btns'>
            <View className="btn" onClick={this.jump.bind(this, 1)}>开始测试</View>
            {global.platform !== 2 && <View className="btn" onClick={this.jump.bind(this, 2)}>压力模式</View>}
            <View className="btn" onClick={this.jump.bind(this, 3)}>查看榜单</View>
          </View>
        </View>
      </PageView>
    )
  }
}

export default StartPage 
