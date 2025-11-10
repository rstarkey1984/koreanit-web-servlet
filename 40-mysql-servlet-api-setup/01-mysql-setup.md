# Ubuntu에서 MySQL 설치 및 설정

## 📘 학습 개요
Ubuntu에서 MySQL 설치 및 설정하기

## 💡 주요 내용
- MySQL 이란?
- MySQL 설치 및 설정
- 데이터베이스 및 테이블 만들기
- SQL Query 실습

## 1. MySQL 이란?
> MySQL은 관계형 데이터베이스 관리 시스템(RDBMS) 중 하나로, 전 세계에서 가장 많이 사용되는 오픈소스 데이터베이스입니다. 간단히 말해, 데이터를 테이블(Table) 형태로 저장하고 관리하는 소프트웨어입니다.

- 주요 특징
  | 특징                     | 설명                                                          |
  | ---------------------- | ----------------------------------------------------------- |
  | **관계형 데이터베이스 (RDBMS)** | 데이터를 테이블(TABLE) 구조로 저장하고, 테이블 간 관계를 설정할 수 있음.                   |
  | **SQL 사용**             | `SELECT`, `INSERT`, `UPDATE`, `DELETE` 같은 SQL 언어로 데이터를 조작함. |
  | **오픈소스**               | 무료로 사용할 수 있고, 소스코드도 공개되어 있음. (현재는 Oracle이 관리)               |
  | **속도와 안정성**            | 웹 서비스나 애플리케이션에서 빠르고 안정적으로 작동.                               |
  | **다양한 운영체제 지원**        | Windows, Linux, macOS 등에서 사용 가능.                            |
  | **서버-클라이언트 구조**        | MySQL 서버에 접속해서 데이터를 주고받는 방식.                                |

- 왜 많이 쓰일까?

  1. 무료 + 설치 간단 + 속도 빠름

  2. WordPress, 카카오톡 게임, 네이버 카페 등도 내부적으로 MySQL 또는 MariaDB 사용

  3. JDBC, Python, PHP 등 다양한 언어와 쉽게 연결 가능


## 2. MySQL 설치 및 설정

1. 패키지 목록 업데이트 

    > 시스템의 패키지 목록을 최신 상태로 업데이트합니다.  
    ```bash
    sudo apt update
    ```

2. `MySQL` 설치
    ```bash
    sudo apt install -y mysql-server
    ```

3. `MySQL` 서비스 상태 확인
    ```bash
    sudo systemctl status mysql
    ```

4. `MySQL` 보안 설정

    > MySQL 설치 후 초기 보안 설정을 수행합니다. `mysql_secure_installation` 명령어를 사용하여 루트 사용자 비밀번호를 설정하고, 불필요한 기본 설정을 제거할 수 있습니다.

    ```bash
    sudo mysql_secure_installation
    ``` 

    1. 비밀번호 정책 설정 ( `n` 하면 비밀번호 자유롭게 설정가능. `y` 하면 비밀번호 설정할때 대소문자랑 특수문자 강제됨 )

    2. 설치시 자동으로 익명 사용자(anonymous user) 계정을 생성했는데 삭제할지 여부 ( `y` 삭제하는게 좋음 )

    3. MySQL의 root 계정이 원격(리모트)에서 접속하지 못하도록 막을 건지 묻는 단계입니다. ( 보안상 무조건 `y` )

    4. 기본으로 test 데이터베이스가 생성이 되어있는데 삭제할건지 묻는 단계 ( MySQL 8.0부터는 기본적으로 test DB가 없기 때문에, 아무거나 해도 상관없음 )

    5. 지금까지 설정한 사용자 권한 변경 내용들을 바로 적용할지 물어보는 단계 ( `y` )

5. `MySQL` 접속 및 사용자 추가

    1. Ubuntu 관리자 권한으로 MySQL 클라이언트를 실행하고 `root` 계정으로 접속:       

        ```bash
        sudo mysql
        ```
    
    2. 사용자 만들기

        ```sql
        CREATE USER '유저'@'localhost' IDENTIFIED BY '비밀번호';
        ```

    3. 권한 주기
        ```sql
        GRANT ALL PRIVILEGES ON *.* TO '아이디'@'localhost' WITH GRANT OPTION;
        ```

    4. 변경된 사용자 및 권한 적용
        ```sql
        FLUSH PRIVILEGES;
        ```

    5. 사용자 목록 확인
        ```sql
        SELECT user, host FROM mysql.user;
        ```

    6. 비밀번호 변경
        ```sql
        ALTER USER '아이디'@'localhost' IDENTIFIED BY '비밀번호';
        ```

    7. 계정삭제
        ```sql
        DROP USER '유저'@'localhost';
        ```        

    8. (참고) 비밀번호 정책 확인 및 완화
        > 비밀번호 정책 때문에 변경이 안될 때는 다음을 확인하세요:
        ```sql
        SHOW VARIABLES LIKE 'validate_password%';
        ```
        ```sql
        SET GLOBAL validate_password.policy = LOW;
        ```
        ```sql
        SET GLOBAL validate_password.length = 4;
        ```

## 3. 데이터베이스 및 테이블 만들기
> MySQL에서는 **데이터베이스(Database) = 스키마(Schema)** 같은 의미 입니다.
    

1. Database (데이터베이스)란?
    > 여러 테이블을 묶는 폴더 같은 개념
    ```
    MySQL 서버 (DBMS)
        └─ Database (Schema)
            └─ Table (테이블)
            └─ Table (테이블)
            └─ Table (테이블)
    ```
    - Database/Schema는 테이블들을 보관하는 논리적 공간

2. Table (테이블) 이란?
    > 행(Row)과 열(Column)로 이루어진 2차원 구조의 데이터 저장소

    | id | name   | price |
    | -- | ------ | ----- |
    | 1  | Apple  | 1000  |
    | 2  | Banana | 1500  |
    - 테이블 = 엑셀 시트 느낌

    - 한 테이블은 하나의 주제(상품, 회원, 주문 등)만 저장하도록 설계


3. MySQL 클라이언트 다운로드
    - https://dev.mysql.com/downloads/workbench/


4. MySQL 접속 설정    

- `+` 아이콘을 클릭해서 새로운 접속 설정 ( Setup New Connection ) 창을 연다.

    1. `Connection` 탭 설정

        1. `Connection Name` 을 입력하고 `Connection Method` 를  `Standard TCP/IP over SSH` 선택

        2. SSH Username 입력 ( Ubuntu 서버 사용자이름 )

        3. `SSH Key File` 비공개키 선택

        4. Username 을 MySQL 사용자 입력

        5. `Store in Vault` 버튼 클릭 후 MySQL user 패스워드 입력


    2. `Remote Management` 탭 설정

        1. SSH login based management 선택

        2. Username 에 Ubuntu 서버 사용자 이름 입력

        3. `Authenticate Using SSH Key` 체크

        4. `SSH Key Path` 에 비공개키 선택
        
    
    3. `System Profile` 탭 설정

        1. `System Type` 을 `Linux` 선택

        2. `Configuration File` 에 `/etc/mysql/mysql.conf.d/mysqld.cnf` 입력

        3. `Start MySQL` 에 `sudo systemctl start mysql` 입력

        4. `Stop MySQL` 에 `sudo systemctl stop mysql` 입력


5. 데이터베이스 생성 

    1. `Schemas` 탭에서 우클릭

    2. `Create Schema` 선택

    3. `Name` 에 데이터베이스 이름 입력 후 오른쪽 아래 `Apply`

    4. 새 창이 뜨면 또 `Apply`

6. User 테이블 생성 

    1. 왼쪽 `Schemas` 더블클릭 또는 아래화살표로 펼친다.

    2. `Tables` 우클릭 후 `Create Table`

    3. SQL Query
        ```sql
        CREATE TABLE `test`.`user` (
            `idx` int NOT NULL AUTO_INCREMENT,
            `id` varchar(10) NOT NULL,
            `password` varchar(64) NOT NULL,
            `email` varchar(45) NOT NULL,
            `reg_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`idx`),
            UNIQUE KEY `id_UNIQUE` (`id`)) 
        ```

7. Board 테이블 생성

    1. 왼쪽 `Schemas` 더블클릭 또는 아래화살표로 펼친다.

    2. `Tables` 우클릭 후 `Create Table`

    3. SQL Query
        ```sql
        CREATE TABLE `test`.`board` (
            `idx` INT NOT NULL AUTO_INCREMENT,
            `title` VARCHAR(45) NOT NULL,
            `content` TEXT NOT NULL,
            `reg_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`idx`));
        ```

## 4. SQL CRUD 예제
> MySQL에서 CRUD란, 데이터베이스의 데이터를 다룰 때 사용하는 가장 기본적이고 핵심적인 4가지 작업을 말합니다.
- CRUD란?
    > CRUD는 다음 4개의 기능의 머리글자를 따서 만든 용어입니다:

    | 기능             | 뜻      | MySQL SQL 문법 |
    | -------------- | ------ | ------------ |
    | **C – Create** | 데이터 생성 | `INSERT`     |
    | **R – Read**   | 데이터 조회 | `SELECT`     |
    | **U – Update** | 데이터 수정 | `UPDATE`     |
    | **D – Delete** | 데이터 삭제 | `DELETE`     |

- 왜 CRUD가 중요할까?
    - 모든 웹/앱 서비스는 결국 CRUD (회원가입, 로그인, 게시글 작성, 수정, 삭제 등 모두 CRUD 기반)

    - REST API, Spring, Node.js, Django, Servlet 등에서도 기본 구조

    - 데이터베이스 학습의 첫 단계이자 실무에서도 계속 쓰임


1. Insert (데이터 생성)
    > test 데이터베이스의 user 테이블에 새로운 사용자 추가
    ```sql
    INSERT INTO `test`.`user` (`id`, `password`, `email`) VALUES ('id', 'mypassword', 'email@email.com');
    ```

    > test 데이터베이스의 board 테이블에 새 게시글 추가
    ```sql
    INSERT INTO `test`.`board` (`title`, `content`) VALUES ('제목', '내용');
    ```

2. Select (데이터 조회)
    > user 테이블의 모든 데이터 조회
    ```sql
    SELECT * FROM test.user;
    ```

    > board 테이블의 모든 데이터 조회
    ```sql
    SELECT * FROM test.board;
    ```

3. UPDATE (데이터 수정)
    > user 테이블에서 idx가 '1'인 데이터의 email 값을 수정
    ```sql
    UPDATE `test`.`user` SET `email` = 'example@example.com' WHERE `idx` = '1';
    ```

    > board 테이블에서 idx가 '1'인 게시글의 제목 변경
    ```sql
    UPDATE `test`.`board` SET `title` = '제목변경' WHERE `idx` = '1';
    ```

4. DELETE (데이터 삭제)
    > user 테이블에서 idx가 '1'인 데이터 삭제
    ```sql
    DELETE FROM `test`.`user` WHERE `idx` = '1';
    ```
    > board 테이블에서 idx가 '1'인 게시글 삭제
    ```sql
    DELETE FROM `test`.`board` WHERE `idx` = '1';
    ```


## 🧩 실습 / 과제
- 새로운 테이블 만들고, 10개의 행(Row)을 직접 INSERT해서 SELECT 해보기.