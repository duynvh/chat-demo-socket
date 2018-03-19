(function($) {
	$.App = function(options) {

		var socket = io.connect('http://localhost:3000');
		var timeoutTyping = null;
		var iconsList 		= {
								'icon_devil'		:'3:)',
								'icon_angel'		:'O:)',
								'icon_smile' 		:':)',
								'icon_grumpy'		:'>:(',
								'icon_frown'		:':(',
								'icon_tongue'		:':P',
								'icon_grin'			:'=D',
								'icon_upset'		:'>:o',
								'icon_gasp'			:':o',
								'icon_wink'			:';)',
								'icon_pacman'		:':v',
								'icon_unsure'		:':/',
								'icon_cry'			:":'(",
								'icon_kiki'			:'^_^',
								'icon_glasses'		:'8-)',
								'icon_sunglasses'	:'B|',
								'icon_heart'		:'<3',
								'icon_squint'		:'-_-',
								'icon_confused'		:'o.O',
								'icon_colonthree'	:':3',
								'icon_like'			:'(y)'
							};
		init();
		function init() {
			authInit();

			roomInit();

			friendInit();
		}

		/* Login - Logout */
		function authInit() {
			authEvent();

			authSocket();
		}

		function authEvent() {
			$('#usersList a.use').click(function(e) {
				let id = $(this).data('id');
				$('.popup-loading').show();
				socket.emit('auth-login', id);
			});

			$("#logoutBtn").click((e) => {
				socket.emit('auth-logout');
			});
		}

		function authSocket() {
			socket.on('auth-visit', (data) => {
				$.each(data, function(i, id) {
					$("#usersList .user" + id).find('a.use').addClass('hide');
					$("#friendsList .user"+id).find('span.status').removeClass('hide');
				})
			});


			socket.on('auth-logged', (user) => {
				$("#friendsList .user"+user.id).remove();
				$("#Popup").fadeOut('slow');
				$("#authName").text(user.name);
			});

			// auth-joined
			socket.on('auth-joined', (id) => {
				$("#usersList .user" + id).find('a.use').addClass('hide');
				$("#friendsList .user"+id).find('span.status').removeClass('hide');
			});

			socket.on('auth-logout', () => {
				window.location.href = "";
			});

			socket.on('auth-leaved', (data) => {
				$("#usersList .user" + data).find('a.use').removeClass('hide');
				$("#friendsList .user"+data).find('span.status').addClass('hide');
			});
		}

		// Room chat
		function roomInit() {
			roomEvent();

			roomSocket();
		}

		function roomEvent() {
			$('#roomSendBtn').click(() => {
				var msg = $('#room_message_content').val();
				$('#room_message_content').val('');
				socket.emit('room-message-send', msg);
			});
		}

		function roomSocket() {
			socket.on('room-message-new', (data) => {
				let li = $("#templateRoomMessage").html();

				li = li.replace(/{AVATAR}/g,data.authInfo.avatar);
				li = li.replace(/{NAME}/g,data.authInfo.name);
				li = li.replace(/{CREATED}/g,data.msg.created);
				li = li.replace(/{MESSAGE}/g,data.msg.message);

				$('.message-room-list').append(li);
				$('.scrollableAreaWrap').scrollTop( $('.scrollableAreaContent').height() );
			});
		}

		// Friend chat
		function friendInit() {
			friendEvent();

			friendSocket();
		}

		function friendEvent() {
			$('#friendsList a').click(function(e){
				//id,name,avatar
				var id 		= $(this).data('id');
				var name 	= $(this).children('span.name').text();
				var avatar 	= $(this).find('img').attr('src');
				
				if(!$('#chat'+id).length){
					friendWindowNew({id:id,name:name,avatar:avatar});
				}
				//Focus Case 1
				friendWindowFocus('#chat'+id,true);
			});

			$('body').on('click','#windowsChat li i.close',function(e){
				$(this).closest('li').remove();
			});

			$('body').on('click','#windowsChat li .titleBar h4',function(e){
				$(this).closest('li').toggleClass('off');
			});

			$('body').on({
				focus: function(e) {
					friendWindowFocus($(this).closest('li'), false);

					if( $(this).closest('li').hasClass('new')){
						var li   = $(this).closest('li');
						
						var data = {
								    userId:$(li).data('id'),
								    messageId:$(li).find('.conversation .message:last').data('id')
								   };
						
						socket.emit('friend-message-viewed',data);
					}
				},
				keydown: function(e) {
					if(e.keyCode == 13 && $.trim($(this).val()) != '') {
						let data = {id : $(this).closest('li').data('id'),
								    message: $.trim($(this).val())};

						// Show Message
						friendMessageNew(data, true);
						// Emit to server
						socket.emit('friend-message-send', data)
					} else {
						var id = $(this).closest('li').data('id');
						friendTyping(id);
					}
				}
			}, '#windowsChat li input.input');

			$('body').on('click','a.toggleIcon',function(e){
				$(this).closest('.emoticonsPanel').toggleClass('open');
			});

			$('body').on('click','.iconItem a.icon',function(e){
				
				var cl 		= $(this).attr('class').split(' ')[1];
				var chars 	= iconsList[cl];
				var input   = $(this).closest('.layoutSubmit').children('input.input');
				$(input).val( $(input).val() + ' ' +chars+' ' );
				
				$(this).closest('.emoticonsPanel').removeClass('open');
			});
		}

		function friendSocket() {

			// Event to user receive message
			socket.on('friend-message-new', (data) => {
				if(!$('#chat'+data.id).length){
					var dataWindow = $.extend(false,data,{avatar:'images/avatars/'+data.avatar});
					friendWindowNew(dataWindow);
				}
				// Show Message
				friendMessageNew(data, false);
			});

			socket.on('friend-typing', (id) => {
				if($('#chat'+id).length){ 
					$('#chat'+id).find('.typing').show();
				}
			});

			socket.on('friend-typing-stop', (id) => {
				if($('#chat'+id).length){ 
					$('#chat'+id).find('.typing').hide();
				}
			});

			socket.on('friend-message-viewed', (data) => {
				if($('#chat'+data.id).length){ 
					$('#chat'+data.id).find('.viewed').show()
					.children('span').text(data.created);
				}
			});
		}


		// FRIEND FUNCTION

		function friendWindowNew(data) {
			let li 		= $('#templateChatWindow').html();
			li = li.replace(/{ID}/g,data.id);
			li = li.replace(/{NAME}/g,data.name);
			li = li.replace(/{AVATAR}/g,data.avatar);
			$('#windowsChat').append(li);
		}

		function friendWindowFocus(selector, flag) {
			$('#windowsChat').children('li').removeClass('focus');
			$(selector).addClass('focus');
			if(flag) $(selector).find('input.input').focus();
		}

		function friendMessageNew(data, me) {
			let li = $('#chat' + data.id);
			if(me) {
				var div = $('#templateChatMessageMe').html();
				li.find('input.input').val('');
			}
			else {
				var div = $('#templateChatMessageFriend').html();
				div = div.replace(/{AVATAR}/g, data.avatar);
				div = div.replace(/{NAME}/g, data.name);
				div = div.replace(/{ID}/g, data.messageId);
			}

			// Message
			data.message = friendMessageConvertIcons(data.message);
			div = div.replace(/{MESSAGE}/g, data.message);
			
			li.find('.conversation').append(div).end().find('.layoutBody').scrollTop(li.find('.conversation').height());
			
			if(!me){
				li.addClass('new');
			}
		}

		

		function friendTyping(id) {
			socket.emit('friend-typing', id);
			clearTimeout(timeoutTyping);
			timeoutTyping = setTimeout(() => {
				socket.emit('friend-typing-stop', id);
			}, 2000);
		}

		function friendMessageConvertIcons(value){
			// <3 => <span class="icon icon_heart"></span>
			$.each(iconsList,function(cl,char){
				if(value.indexOf(char) >= 0){
					
					char = char.replace(/\(/g,'\\(')
					           .replace(/\)/g,'\\)')
					           .replace(/\^/g,'\\^')
					           .replace(/\|/g,'\\|');
					
					var regex = new RegExp(char,"g");
					value = value.replace(regex,'<span class="icon '+cl+'"></span>');
				}
			});
			return value;
		}
	}
})(jQuery);

$(document).ready((e) => {
	$.App();
});
