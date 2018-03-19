<?php 
	
	require_once 'includes/Database.class.php';
	
	$Database = new Database();
	$users 	  = $Database->getUserList();
	
?>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	
	<link href="css/styles.css" rel="stylesheet">
	<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
	<script src="http://localhost:3000/socket.io/socket.io.js"></script>
	<script src="js/app.js"></script>

	<title>Nodejs - Zendvn</title>
</head>
<body>
	<!-- body Wrapper -->
	<div class="body-wrapper">
		
		<div class="room-wrapper panel">
			<div class="panel-heading">
				<h3>CHAT ROOM</h3>
			</div>
			<div class="panel-body">
				<div class="scrollableArea">
					<div class="scrollableAreaWrap">
						<div class="scrollableAreaContent">
							<ul class="message-room-list">
							</ul>
						</div>
					</div>
				</div>
				<div class="send-message-form">
					<div class="body-form">
						<form id="room-form" name="room-form" action="" method="post" onsubmit="return false;">
							<div class="textarea">
								<textarea placeholder="Write your message..." name="room_message_content" id="room_message_content" rows="5"></textarea>
							</div>
							<div class="btn">
								<button type="submit" class="btn" id="roomSendBtn">Send</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		
		<div class="friends-wrapper panel">
			<div class="panel-heading">
				<span class="auth">Hello, <span id="authName">Iker Casillas</span></span>
				<a id="logoutBtn" class="logout" href="javascript:;">Logout</a>
			</div>
			<div class="panel-body">
				<ul class="users-list" id="friendsList">
					<?php foreach ($users as $user): ?>
					<li class="user<?php echo $user['id']; ?>">
						<a data-id="<?php echo $user['id']; ?>"> 
							<span class="img"> <img alt="" src="images/avatars/<?php echo $user['avatar']; ?>"> </span> 
							<span class="name"><?php echo $user['name']; ?></span> 
							<span class="status hide">Online</span>
						</a>
					</li>
					<?php endforeach;?>
				</ul>
			</div>
		</div>
	</div>

	<!-- Windows Chat -->
	<div class="windows-wrapper">
		<div class="container">
			<div class="ChatTabsPagelet">
				<ul class="windowsChat" id="windowsChat">
					
				</ul>
			</div>
		</div>
	</div>

	<!-- LOGIN POPUP-->
	<div id="Popup" class="popup-wrapper block" style="display: block;">
		<div class="popup-dialog">
			<div class="popup-content">
				<div class="popup-header">
					<h4>LOGIN</h4>
				</div>
				<div class="popup-body">
					<div class="loginWrapper">
						<ul class="users-list" id="usersList">
							<?php foreach ($users as $user): ?>
							<li class="user<?php echo $user['id']; ?>">
								<div>
									<span class="img"> <img alt="" src="images/avatars/<?php echo $user['avatar']; ?>"></span> 
									<span class="name"><?php echo $user['name']; ?></span> 
									<a class="use" title="Use this account" href="javascript:;" data-id="<?php echo $user['id']; ?>">Use</a>
								</div>
							</li>
							<?php endforeach;?>

						</ul>
					</div>
					<div class="popup-loading">
						<div class="loading-container"></div>
					</div>
					<div class="popup-error">
						<div class="error-container">Opp! Something went wrong. Please Try Again.</div>
					</div>
				</div>
			</div>
		</div>
	</div>

<script id="templateChatMessageFriend" type="text/x-handlebars-template">
<div class="message clearfix" data-id="{ID}">
	<div class="avatar">
		<img src="images/avatars/{AVATAR}" alt="{NAME}" width="32" height="32">
	</div>
	<div class="msg-body">
		<div class="kso">
			<span>{MESSAGE}</span>
		</div>
	</div>
</div>
</script>	
	
<script id="templateChatMessageMe" type="text/x-handlebars-template">
<div class="message clearfix me">
	<div class="msg-body">
		<div class="kso">
			<span>{MESSAGE}</span>
		</div>
	</div>
</div>	
</script>	
<script id="templateChatWindow" type="text/x-handlebars-template">
<li id="chat{ID}" data-id="{ID}">
	<div class="layoutInner">
		<div class="titleBar clearfix ">
			<h4>{NAME}</h4>
			<i class="close"></i>
		</div>
		<div class="layoutBody">
			<div class="conversation">

			</div>
			<div class="typing" style="display: none;">
				<div class="message clearfix">
					<div class="avatar">
						<img src="{AVATAR}" alt="{NAME}" width="32" height="32">
					</div>
					<div class="bg"></div>
				</div>
			</div>
			<div class="viewed">
				<i></i> Đã xem lúc <span></span>
			</div>
		</div>
		<div class="layoutSubmit">
			<input name="message" class="input">
			<div class="iconWrap">
				<div class="emoticonsPanel">
					<a title="Choose a sticker" class="toggleIcon"><i class="emoteToggler"></i></a>
					<div class="iconLayout">
						<div class="iconLists">
							<div class="iconItem">
								<a class="icon icon_smile" title="smile"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_frown" title="frown"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_tongue" title="tongue"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_grin" title="grin"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_gasp" title="gasp"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_wink" title="wink"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_pacman" title="pacman"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_grumpy" title="grumpy"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_unsure" title="unsure"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_cry" title="cry"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_kiki" title="kiki"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_glasses" title="glasses"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_sunglasses" title="sunglasses"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_heart" title="heart"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_devil" title="devil"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_angel" title="angel"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_squint" title="squint"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_confused" title="confused"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_upset" title="upset"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_colonthree" title="colonthree"></a>
							</div>
							<div class="iconItem">
								<a class="icon icon_like" title="like"></a>
							</div>
						</div>
						<div class="layoutArrow"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</li>
</script>		
	
<script id="templateRoomMessage" type="text/x-handlebars-template">
<li class="message">
	<div class="clearfix">
		<div class="avatar">
			<img src="images/avatars/{AVATAR}" alt="{NAME}" width="32" height="32">
		</div>
		<div class="content clearfix">
			<div class="created">
				<i></i> <span>{CREATED}</span>
			</div>
			<div>
				<div class="fullname">{NAME}</div>
				<div class="msg">{MESSAGE}</div>
			</div>
		</div>
	</div>
</li>
</script>	
	
	
</body>
</html>