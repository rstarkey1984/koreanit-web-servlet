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


---

## NOTE : Nginx를 리버스프록시 서버로 사용하면서 생기는문제 수정하기

- 클라이언트 진짜 IP를 톰캣이 못 받음.

- 톰캣에서 리다이렉트 시킬때 본인의 호스트 주소로 보냄. ( 예: jsp.servlet.localhost )

- 그래서 nginx 랑 server.xml 에서 설정 수정해야함.

    ### `java.localhost`
    ```nginx
    server {
        listen 80;                     # IPv4 기준으로 80번 포트(HTTP 요청)를 수신
        listen [::]:80;                # IPv6 환경에서도 80번 포트 요청을 수신

        server_name java.localhost;    # Host 헤더가 'java.localhost'일 때 이 서버 블록으로 연결

        charset utf-8;                 # 응답에 기본 문자 인코딩을 UTF-8로 설정 (Content-Type 기반)

        location / {                # /api로 시작하는 모든 요청을 처리하는 블록

            proxy_pass http://127.0.0.1:8081/;  # 요청을 내부의 Tomcat 또는 다른 서버(127.0.0.1:8081)로 전달

            # 업스트림 호스트 선택용 (Tomcat 가상호스트 매칭)
            proxy_set_header Host jsp.servlet.localhost;

            # 리다이렉트/링크용
            proxy_set_header X-Forwarded-Host $host;        # java.localhost
            proxy_set_header X-Forwarded-Proto $scheme;     # http 또는 https
            proxy_set_header X-Forwarded-Port $server_port; # 80 또는 443
            
            # 클라이언트 실제 아이피를 톰캣이 받을수 있음
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        }
    }
    ```

    ### `server.xml`
    ```xml
    <!-- jsp.servlet.localhost 가상호스트 설정 -->
    <Host name="jsp.servlet.localhost" appBase="webapps/jsp.servlet.localhost" unpackWARs="false" autoDeploy="false">

        <!-- ===========================================================
        RemoteIpValve 설정 (리버스 프록시 뒤에서 외부 요청 정보 복원)

        ✔ 목적:
        - Nginx 등 프록시 서버가 전달한 X-Forwarded-* 헤더를 해석하여
        request.getScheme(), getServerName(), getServerPort() 값을
        외부 기준(클라이언트가 접속한 도메인/프로토콜/포트)으로 바꿔줍니다.
        - sendRedirect(), request.getRequestURL() 등이 내부 주소(예: localhost:8081)
        대신 외부 주소(예: https://java.localhost)로 정상 작동하게 됩니다.

        ✔ 주요 속성:
        - internalProxies : 신뢰할 수 있는 내부 프록시 IP 범위 (정규식)
        → 개발 환경: ".*" (모두 허용)
        → 운영 환경: "127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+" 등 제한 권장
        - remoteIpHeader : Nginx가 보내주는 클라이언트 IP
        - protocolHeader : 클라이언트 실제 스킴 (예: X-Forwarded-Proto: http/https)
        - portHeader     : 클라이언트 실제 포트 (예: X-Forwarded-Port: 80/443)
        - hostHeader     : 클라이언트 실제 호스트 (예: X-Forwarded-Host: java.localhost)
        =========================================================== -->
        <Valve className="org.apache.catalina.valves.RemoteIpValve"
            internalProxies=".*"
            remoteIpHeader="X-Real-IP"
            protocolHeader="X-Forwarded-Proto"
            portHeader="X-Forwarded-Port"
            hostHeader="X-Forwarded-Host" />

    </Host> 
    ```

## ⚙️ 5. DB 연결 풀(DataSource)을 만들고, JNDI를 통해 불러오기

- DataSource 란? 
    > 데이터베이스 연결(Connection)을 만들어주는 객체입니다. 톰캣이 미리 여러 개의 연결을 만들어 **“커넥션 풀(Connection Pool)”** 에 보관해두고, 필요할 때마다 getConnection()으로 하나씩 꺼내 쓰는 구조입니다.

- JNDI (Java Naming and Directory Interface) 란?
    > 자바에서 “이름(Name)”으로 객체(Resource)를 찾아올 수 있는 디렉터리 서비스 API입니다.

- /etc/tomcat10/Catalina/jsp.servlet.localhost/`ROOT.xml` 파일에 `<Resource />` 추가
    ```xml
    <Context ...>
    ...
    <!-- MySQL 커넥션 풀 -->
    <Resource
        name="jdbc/MyDB"
        auth="Container"
        type="javax.sql.DataSource"
        driverClassName="com.mysql.cj.jdbc.Driver"
        url="jdbc:mysql://localhost:3306/test?useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=Asia/Seoul"
        username="test"
        password="test123"
        maxTotal="30"
        maxIdle="10"
        maxWaitMillis="10000"
        validationQuery="SELECT 1"
    /> 
    <!-- MySQL 커넥션 풀 -->
    ...
    </Context>     
    ```
    - 톰캣이 이 설정을 읽고 `DataSource` 객체를 생성한 뒤, “`jdbc/MyDB`” 이름으로 `JNDI` 환경에 등록(binded)합니다.

- /WEB-INF/`web.xml`
    > `<resource-ref>` 태그는 서블릿 코드에서 `JNDI`로 참조할 외부 자원을 “선언(declare)”하는 부분입니다. 즉, 애플리케이션이 사용할 리소스의 이름(res-ref-name), 타입(res-type), 인증 방식(res-auth) 등을 미리 명시하여, 톰캣이 해당 이름을 JNDI 환경(java:comp/env/)에 매핑할 수 있도록 알려주는 역할을 합니다.
    ```xml
    <resource-ref>
        <description>MySQL Connection Pool</description>
        <res-ref-name>jdbc/MyDB</res-ref-name>
        <res-type>javax.sql.DataSource</res-type>
        <res-auth>Container</res-auth>
    </resource-ref>
    ```

    - 이 선언 덕분에 서블릿 코드에서는 다음처럼 안전하게 JNDI Lookup을 수행할 수 있습니다:
    
    - `.java` 코드
        ```java
        Context ctx = new InitialContext();
        DataSource ds = (DataSource) ctx.lookup("java:comp/env/jdbc/MyDB");
        ```
        > 즉, `<resource-ref>`는 코드에서 사용할 리소스의 계약서(Interface 선언) 역할을 하고, 실제 연결 정보(driverClassName, url, username, password 등)는 `<Context>`의 `<Resource>` 항목에서 구체적으로 구현(define) 됩니다.
        

- 역할 정리

    | 요소               | 위치                          | 역할            | 톰캣에서의 의미                       |
    | ---------------- | --------------------------- | ------------- | ------------------------------ |
    | `<Resource>`     | `context.xml` 또는 `ROOT.xml` | **리소스 정의**    | “이 이름의 DataSource를 톰캣이 관리한다.”  |
    | `<resource-ref>` | `WEB-INF/web.xml`           | **리소스 참조 선언** | “이 웹앱이 그 DataSource를 사용할 것이다.” |

- 전체 흐름 요약

    | 단계 | 구성요소             | 하는 일                     |
    | -- | ---------------- | ------------------------ |
    | ①  | `<Resource>`     | 실제 DB 커넥션 풀을 정의하고 톰캣이 관리 |
    | ②  | `<resource-ref>` | 웹앱이 사용할 리소스 이름/타입을 선언    |
    | ③  | Java 코드          | `lookup()`으로 리소스 찾아서 사용  |


## 🧩 6. DB 연결 (DB.java)
```java
package localhost.myapp.common;

import javax.naming.InitialContext;
import javax.naming.Context;
import javax.sql.DataSource;

/**
 * DB DataSource 헬퍼 (JNDI 기반, Lazy-init + Double-Checked Locking)
 *
 * 역할
 * - 톰캣(JNDI)에 등록된 커넥션 풀(javax.sql.DataSource)을 최초 1회만 조회(lookup)하고,
 *   이후에는 같은 인스턴스를 재사용한다(캐싱).
 *
 * 왜 필요한가
 * - 매 요청마다 InitialContext.lookup()을 호출하는 것은 불필요한 오버헤드가 될 수 있다.
 * - 애플리케이션 전역에서 동일한 DataSource를 안전하게 공유하려면 스레드-세이프한 캐시가 유용하다.
 *
 * 전제
 * - 톰캣의 Context 설정에 아래와 같이 Resource가 정의되어 있어야 한다.
 *   <Resource name="jdbc/MyDB" ... type="javax.sql.DataSource" ... />
 * - (선택) web.xml에 <resource-ref>로 res-ref-name/res-type 매핑을 선언하면
 *   컨테이너가 java:comp/env 네임스페이스에 안전하게 바인딩한다.
 *
 * 주의 사항
 * - 실제 커넥션(Connection) 객체는 여기서 만들지 않는다.
 *   DataSource는 '풀'의 핸들이고, Connection은 필요할 때마다 ds.getConnection()으로 빌려 쓰고 닫는다.
 * - DataSource 자체는 닫을 필요가 없다(컨테이너가 라이프사이클 관리).
 */
public class DB {

    /**
     * DataSource 캐시 필드.
     *
     * - volatile:
     *   더블 체크 락킹(DCL) 패턴에서 가시성/재정렬 문제를 방지하기 위해 필요.
     *   (JMM 상 안전한 DCL을 보장하기 위한 핵심 키워드)
     */
    private static volatile DataSource ds;

    /**
     * 애플리케이션 전역 DataSource 접근자.
     *
     * 동작
     * 1) 최초 호출 시에만 JNDI lookup 수행(느긋한 초기화, Lazy Initialization).
     * 2) 이후 호출은 캐시된 ds를 즉시 반환(오버헤드 최소화).
     *
     * 스레드-세이프
     * - DCL(Double-Checked Locking) + synchronized 블록으로 초기화 경쟁 방지.
     *
     * @return 톰캣이 관리하는 javax.sql.DataSource (커넥션 풀 핸들)
     * @throws RuntimeException 초기화 실패(예: 네이밍 불일치, 컨텍스트 미바인딩) 시 래핑하여 던짐
     */
    public static DataSource getDataSource() {
        // 1차 체크: 이미 초기화된 경우 동기화 없이 빠르게 반환
        if (ds == null) {
            synchronized (DB.class) {
                // 2차 체크: 여러 스레드가 동시 접근했더라도 최초 1회만 초기화 보장
                if (ds == null) {
                    try {
                        // JNDI 초기 컨텍스트
                        Context ic = new InitialContext();

                        /*
                         * java:comp/env/ 접두사
                         * - 웹 애플리케이션마다 분리된 "컴포넌트 전용" JNDI 네임스페이스.
                         * - <resource-ref>를 사용하면 res-ref-name으로 이 네임스페이스에 매핑된다.
                         * - 여기서는 "jdbc/MyDB"라는 이름으로 바인딩된 DataSource를 찾는다.
                         *
                         * Lookup 이름 정리
                         * - 애플리케이션 코드에서는 보통 "java:comp/env/jdbc/MyDB"로 조회.
                         * - 톰캣 Context의 <Resource name="jdbc/MyDB" .../> 와 일치해야 한다.
                         */
                        ds = (DataSource) ic.lookup("java:comp/env/jdbc/MyDB");

                        /*
                         * 여기서 DataSource 인스턴스는 '커넥션 풀 관리 객체'이지,
                         * 실제 DB 커넥션을 바로 만드는 것은 아니다.
                         * 실제 커넥션은 아래와 같이 필요 시마다 획득:
                         *
                         * try (Connection con = ds.getConnection()) {
                         *     // SQL 작업
                         * } // con.close() 호출로 커넥션 '반납' (풀로 복귀)
                         */

                    } catch (Exception e) {
                        /*
                         * 대표적인 실패 케이스
                         * - javax.naming.NameNotFoundException:
                         *   "jdbc/MyDB" 이름으로 바인딩된 리소스를 찾지 못했을 때.
                         *   → Context/ROOT.xml(or context.xml)의 <Resource name="jdbc/MyDB".../> 확인
                         *   → web.xml의 <resource-ref> res-ref-name 일치 여부 확인
                         *   → 톰캣 재기동 필요 여부 확인
                         *
                         * - NoInitialContextException:
                         *   컨테이너 외부(예: 단위 테스트)에서 실행했고 JNDI가 구성되지 않았을 때.
                         *
                         * 복구 전략
                         * - 배포 환경: 설정/이름 오타 수정 후 재배포
                         * - 테스트 환경: DataSource를 직접 주입(팩토리/DI), 또는 임베디드 컨테이너 사용
                         */
                        throw new RuntimeException(
                            "JNDI lookup failed for 'jdbc/MyDB'. " +
                            "Check <Resource name> and <resource-ref> naming/binding in Tomcat Context.",
                            e
                        );
                    }
                }
            }
        }
        return ds;
    }
}
```

## 🧩 실습 / 과제
- 새로운 테이블 만들고, 10개의 행(Row)을 직접 INSERT해서 SELECT 해보기.