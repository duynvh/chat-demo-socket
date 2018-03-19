<?php
class Database{
	
	const SERVER 	= 'localhost';
	const USERNAME 	= 'root';
	const PASSWORD 	= '';
	const DATABASE  = 'chat';
	
	protected $_connect;
	
	// CONNECT DATABASE
	public function __construct(){
		$connect = mysqli_connect(self::SERVER,self::USERNAME, self::PASSWORD);
		if(!$connect){
			die('Fail connect: ' . mysql_errno());
		}else{
			$this->_connect 	= $connect;
			mysqli_select_db($this->_connect, self::DATABASE);
			$this->query("SET NAMES 'utf8'");
			$this->query("SET CHARACTER SET 'utf8'");
		}
	}
	
	// DISCONNECT DATABASE
	public function __destruct(){
		mysqli_close($this->_connect);
	}
	
	// QUERY
	public function query($sql){
		return mysqli_query($this->_connect,$sql);
	}
	
	// LIST RECORD
	public function listRecord($query){
		$result = array();
		if(!empty($query)){
			$resultQuery = $this->query($query);
			if(mysqli_num_rows($resultQuery) > 0){
				while($row = mysqli_fetch_assoc($resultQuery)){
					$result[] = $row;
				}
				mysqli_free_result($resultQuery);
			}
		}
		return $result;
	}
	
	
	public function getUserList(){
		$sql = 'SELECT * FROM users ORDER BY id ASC';
		$result = $this->listRecord($sql);
		return $result;
	}
	
	
	
	
}