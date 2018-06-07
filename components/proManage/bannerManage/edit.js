ZCC.component.bannerManage_Edit=(function($,window,undefined){
	var obj=function(option){
		this.init(option);
	}

	obj.prototype={
		constructor:obj,
		//id
		imgId:"",
		imgUrl:"",
		//上传数据
		UpContent:"",
		UpTitle:"",
		init:function(option){
			this.$upTitle=option.$upTitle;
			this.$Editor=option.$Editor;
			this.$BottomButton=option.$BottomButton;
			this.$ImgButton=option.$ImgButton;
			this.$ImgBox=option.$ImgBox;
			this.bindEvent();
		},
		//刷新页面
		reflash:function(){
			//清空属性
			this.imgId="",
			this.imgUrl="",
			this.UpContent="",
			this.UpTitle="",
			//情况DOM内容
			this.$upTitle.val("");
			this.$Editor.html("");
			this.$ImgBox.attr("src","");
		},
		//获取输入的标题、日期、编辑器内容
		getDate:function(){
			this.UpTitle=this.$upTitle.val();
			this.UpContent=this.$Editor.html();
			if(this.UpTitle&&this.UpContent&&this.imgId){
				return true
			}else{
				return false;
			}
		},
		//str添加头部
		strAdd:function(){
			var _this=this;
			var str=[
			'<style>body{background: #fefefe;margin-bottom: 3rem;color:#656565;}</style>',
			'<header  class="aui-bar aui-bar-nav"  style="background:#fefefe;position:fixed;top:0;z-index:1000">',
	      		'<a class="aui-pull-left aui-btn" tapmode="hover" onclick="api.closeWin({});">',
					'<span class="aui-iconfont aui-icon-left"></span>',
				'</a>',
	      		'<div class="aui-title">',
	        		_this.UpTitle,
	      		'</div>',
	    	'</header>'].join("");
	    	return str;
		},
		//递交
		submitBanner:function(){
			var _this=this;
			if(_this.getDate()){
				_this.loading();
				$.ajax({
				      "url": "https://d.apicloud.com/mcm/api/Banner",
				      "type": "POST",
				      "cache": false,
				      "headers":apiHeader,
				      "data": 
				    	{
				    		"ImgUrl":_this.imgUrl,
				    		"ImgId":_this.imgId,
				    		"Title":"Banner",
				    		"Content":_this.strAdd()+_this.UpContent,
				    		"Other":[_this.UpTitle],
				    	}
				}).done(function (data, status, header) {
			    	_this.loaded();
			    	_this.layuiAlert("发布成功");
			    	_this.reflash();
				}).fail(function (header, status, errorThrown) {
				});
			}else{
				this.layuiAlert("输入信息不完整");
			}
		},
		//绑定事件
		bindEvent:function(){
			this.uploadPic();
			this.bindAbandonButton();
			this.bindPublicButton();
		},
		//绑定放弃发布按钮
		bindAbandonButton:function(){
			var _this=this;
			this.$BottomButton.children(".btn-danger").on("click.ZCC",function(){
				var index=layer.open({
				  title: '吉趣',
				  btn: ['确定', '取消'],
				  content: "确认是否删除草稿",
				  btnAlign: 'c',
				  yes:function(){//第一个按钮的回调函数
				  	console.log("yes");
				  	//删除图片
				  	_this.deletPic();
				  	//删除文章
				  	_this.reflash();
				  	layer.close(index);			//关闭指定弹窗
				  },
				  btn2:function(){},
				  cancel: function(){}
				});  
			});	
		},
		//绑定发布文章按钮
		bindPublicButton:function(){
			var _this=this;
			var a=this.$BottomButton.children(".btn-primary").on("click.ZCC",function(){
				var index=layer.open({
				  title: '吉趣',
				  btn: ['确定', '取消'],
				  content: "确认是否发布(发布后将立刻显示)",
				  btnAlign: 'c',
				  yes:function(){//第一个按钮的回调函数
				  	_this.submitBanner();		//递交
				  	layer.close(index);			//关闭指定弹窗
				  },
				  btn2:function(){},
				  cancel: function(){}
				});  
			});
		},
		//绑定上传图片
		uploadPic:function(){
			var _this=this;
			var uploader = WebUploader.create({
			    // swf文件路径
			    swf:'components/webuploader/Uploader.swf',
			    // 文件接收服务端。
			    server: 'http://d.apicloud.com/mcm/api/file',
			    // 选择文件的按钮。可选。
			    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
			    pick: _this.$ImgButton,
			    // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			    resize: false,
			    auto: true,
			    accept: {
			        title: 'Images',
			        extensions: 'gif,jpg,jpeg,bmp,png',
			        mimeTypes: 'image/*'
			    }
			});
			uploader.on("fileQueued", function (file) {
				_this.loading();
			    uploader.option('formData', {
			        filename: file.name,
			        type: file.type
			    });
		        uploader.makeThumb( file, function( error, src ) {
			        if ( error ) {
			        	//上传图片出错
			            _this.uploadImgFail();
			            return;
			        }
			        _this.$ImgBox.attr('src', src);
			    },1000,1000);
			});
			//文件上传成功
			uploader.on('uploadSuccess', function (file, res) {
			    if (res && res.id) {
			        _this.uploadImgSuccess(res.id,res.url);
			    } else if (res &&res.status == 0) {
			        _this.uploadImgFail();
			    } else {
			        _this.uploadImgFail();
			    }
			});
			//文件上传失败
			uploader.on('uploadError', function (file, reason) {
			    alert("失败")
			});
			//上传完成，不管成功失败
			uploader.on('uploadComplete', function (file) {
			    uploader.removeFile(file);
			    _this.loaded();
			});
			uploader.on('uploadBeforeSend', function (block, data, headers) {
			    headers["X-APICloud-AppKey"] = window.apiHeader['X-APICloud-AppKey'];
			    headers["X-APICloud-AppId"] = window.apiHeader['X-APICloud-AppId'];
			    _this.deletPic();//删除前一张照片
			});
			//上传中
			uploader.on('uploadProgress',function(file,percentage){
			});
		},
		//图片上传失败
		uploadImgFail:function(){
			//清楚img标签里面的图片
			var _this=this;
			_this.$ImgBox.attr('src', "");
			//弹出提示框
			_this.layuiAlert("图片上传失败,请重新上传");
			_this.imgId=""; 
		},
		//图片上传成功
		uploadImgSuccess:function(id,url){
			this.imgId=id;
			this.imgUrl=url;			
		},
		//删除原有的图片防止数据库冗余
		deletPic:function(){
			//如果之前上传过图片
			if(this.imgId){
				$.ajax({
				  "url": "https://d.apicloud.com/mcm/api/file/"+this.imgId,
				  "cache": false,
				  "headers":apiHeader,
				  "data": {
				    "_method": "DELETE"
				  },
				  "type": "POST"
				}).success(function (data, status, header) {
					console.log("DeleteSuccess:"+JSON.stringify(data));
				}).fail(function (header, status, errorThrown) {
					console.log("DeleteFailure:"+JSON.stringify(header));
				})
			}
		},
		// 加载中
		loading:function(){
			this.layerIndex = layer.load(1, {
			  shade: [0.3,'#000'] //0.1透明度的白色背景
			});
		},
		// 加载完毕
		loaded:function(){
			layer.close(this.layerIndex);
		},
		layuiAlert:function(Content){
			var index=layer.open({
			  title: '吉趣',
			  content: Content,
			  btnAlign: 'c',
			  yes:function(index, layero){
			  	layer.close(index);	
			  },
			  cancel: function(){
			  	layer.close(index);	
			  }
			});  
		},

	}

	return obj;

})(jQuery,this);