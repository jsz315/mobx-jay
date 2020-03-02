import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Video, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import './index.less'
import AudioView from '../../components/audio_view'
import VideoView from '../../components/video_view'
import ShareView from '../../components/share_view'
import scope from '../../utils/scope'
import global from '../../core/global'

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
    const { questionStore } = this.props
    // questionStore.initAsync();

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

    /*
    if(!questionStore.nickName){
      let authorizeRes = await scope.authorize("scope.userInfo");
      if(authorizeRes){
        let userInfoRes = await scope.getUserInfo();
        if(userInfoRes){
          this.saveUser(userInfoRes);
        }
        else{
          //console.log("获取用户数据失败");
        }
      }
      else{
        // this.setState({
        //   showUserBtn: true
        // })
      }
    }
    else{
      console.log("获取本地用户成功")
      Taro.showToast({title: '本地登录成功', icon: 'none'})
    }
    */
  }

  saveUser(userInfo){
    const { questionStore } = this.props
    questionStore.changeNickName(userInfo.nickName);
    questionStore.changeAvatarUrl(userInfo.avatarUrl);
    questionStore.changeGender(userInfo.gender);

    global.setUser({
      openid: questionStore.openid,
      avatarUrl: questionStore.avatarUrl,
      nickName: questionStore.nickName,
      gender: questionStore.gender,
      city: questionStore.city,
      province: questionStore.province,
      platform: global.platform
    });
  }

  componentWillReact () {
    //console.log('componentWillReact')
  }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

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
    else{
       Taro.navigateTo({
        url: '/pages/rank_page/index'
      })
    }
   
  }

  bindGetUserInfo(e){
    console.log(e);
    if(e.detail.userInfo){
      this.saveUser(e.detail.userInfo);
      this.setState({
        showUserBtn: false
      })
    }
    else{
      Taro.showToast({title: '请先授权获取用户数据', icon: 'none'})
    }
  }

  render () {
    const { questionStore } = this.props

    // {
    //       this.state.showUserBtn == true && (
    //         <View className='mask'>
    //           <View className='pop'>
    //             <View className='user-tip'>无需注册，直接点击下面按钮即可使用当前账户登录</View>
    //             <Button className='user-btn' open-type="getUserInfo" onGetUserInfo={this.bindGetUserInfo.bind(this)}>授权登录</Button>
    //           </View>
    //         </View>
    //       )
    //     }

    return (
      <View className='start-page'>
        <View className='btns'>
          <View className="btn" onClick={this.jump.bind(this, 1)}>开始测试</View>
          <View className="btn" onClick={this.jump.bind(this, 2)}>查看榜单</View>
        </View>
      </View>
    )
  }
}

export default StartPage 
