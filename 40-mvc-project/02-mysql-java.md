# MySQL과 Java를 연결하는 방법

## 📘 학습 개요
MySQL 과 JAVA 와 통신하는 방법에 대해서 알아보자.

## 💡 주요 내용
- MySQL + JDBC (DriverManager)

- MySQL + DataSource (Tomcat Connection Pool)

## ⚙️ 브라우저 요청 파라미터 Tomcat 로그에서 확인


`RequestLogFilter.java`
```java
package localhost.myapp.filter; // 필터 클래스가 속한 패키지 선언

import jakarta.servlet.*; // Filter, FilterChain, ServletRequest 등 기본 서블릿 인터페이스
import jakarta.servlet.annotation.WebFilter; // @WebFilter 어노테이션 사용을 위한 import
import jakarta.servlet.http.*; // HttpServletRequest, Cookie 클래스 사용
import java.io.IOException; // IOException 예외
import java.util.*; // Enumeration, Arrays 등 유틸 클래스

@WebFilter("/*") // 모든 요청 URL( /* )에 대해 이 필터가 실행되도록 설정
public class RequestLogFilter implements Filter { // Filter 인터페이스 구현 클래스 정의 시작

    @Override
    public void init(FilterConfig filterConfig) { // 필터 초기화 시 실행되는 메서드
        // 초기화할 내용이 없어서 비워둠
    }

    @Override
    public void doFilter(ServletRequest request, // 클라이언트 요청 객체 (HttpServletRequest의 부모 타입)
            ServletResponse response, // 클라이언트 응답 객체 (HttpServletResponse의 부모 타입)
            FilterChain chain) // 다음 필터 또는 서블릿으로 넘기는 체인 객체
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request; // ServletRequest를 HttpServletRequest로 다운캐스팅

        System.out.println("\n========== REQUEST DEBUG =========="); // 요청 디버그 로그 시작 출력
        System.out.println("URI: " + req.getRequestURI()); // 요청된 URI 출력
        System.out.println("Method: " + req.getMethod()); // 요청 메서드(GET/POST 등) 출력

        // -------------------- Parameters 출력 --------------------
        System.out.println("\n[Parameters]"); // 파라미터 섹션 제목 출력
        req.getParameterMap().forEach( // request.getParameterMap() → 모든 파라미터(key/value) 조회
                (k, v) -> System.out.println("  " + k + " = " + Arrays.toString(v)) // k: 이름, v: 값 배열 형태 출력
        );

        // // -------------------- Headers 출력 --------------------
        // System.out.println("\n[Headers]"); // 헤더 섹션 제목 출력
        // Enumeration<String> headerNames = req.getHeaderNames(); // 모든 헤더 이름을 가져오는
        // Enumeration 객체
        // while (headerNames.hasMoreElements()) { // 헤더가 더 있을 때까지 반복
        // String name = headerNames.nextElement(); // 헤더 이름 하나 가져오기
        // System.out.println(" " + name + ": " + req.getHeader(name)); // 헤더 이름과 값을 출력
        // }

        // // -------------------- Cookies 출력 --------------------
        // System.out.println("\n[Cookies]"); // 쿠키 섹션 제목 출력
        // Cookie[] cookies = req.getCookies(); // 요청에 포함된 모든 쿠키 가져오기
        // if (cookies != null) { // 쿠키가 존재할 경우
        // for (Cookie c : cookies) { // 모든 쿠키 반복
        // System.out.println(" " + c.getName() + ": " + c.getValue()); // 쿠키 이름 = 값 출력
        // }
        // } else { // 쿠키가 없을 경우
        // System.out.println(" (no cookies)"); // "쿠키 없음" 출력
        // }

        System.out.println("===================================\n"); // 로그 구분선 출력

        // -------------------- 필터 체인 계속 진행 --------------------
        chain.doFilter(request, response); // 다음 필터 또는 최종 서블릿으로 요청/응답 전달
    }

    @Override
    public void destroy() { // 필터 종료 시 실행(리소스 정리용)
        // 정리할 내용이 없어서 비워둠
    }
}
```

## ⚙️ Code Formatter 설치 및 `.jsp` 파일 설정

- [Prettier - Code formatter 설치하기](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- `settings.json` - `VSCode` 설정파일
    ```json
    {
        // Java 프로젝트에서 소스 코드가 위치한 경로
        "java.project.sourcePaths": ["WEB-INF/src"],

        // 프로젝트에서 사용할 라이브러리(JAR) 경로들
        "java.project.referencedLibraries": [
            "WEB-INF/lib/*.jar", // WEB-INF/lib 안의 모든 JAR 포함
            "/usr/share/tomcat10/lib/servlet-api.jar" // Tomcat 제공 servlet-api
        ],

        // Java 컴파일 결과(.class 파일) 출력 폴더
        "java.project.outputPath": "WEB-INF/classes",

        // VS Code가 *.jsp 파일을 HTML 파일처럼 인식하도록 설정
        "files.associations": {
            "*.jsp": "html"
        },

        // JSP 파일 저장 시 Prettier로 자동 포매팅
        "[jsp]": {
            "editor.defaultFormatter": "esbenp.prettier-vscode", // Prettier 사용
            "editor.formatOnSave": true // 저장 시 자동 정렬
        },

        // HTML 파일에도 Prettier 자동 포매팅 적용
        "[html]": {
            "editor.defaultFormatter": "esbenp.prettier-vscode",
            "editor.formatOnSave": true
        },

        // Javascript 파일에도 Prettier 자동 포매팅 적용
        "[javascript]": {
            "editor.defaultFormatter": "esbenp.prettier-vscode",
            "editor.formatOnSave": true
        }
    }

    ```

## 1. MySQL + JDBC (DriverManager 직접 사용)
> 가장 기본적인 연결 방식으로, DriverManager.getConnection() 을 이용합니다.

- 구조

    ```
    Java → JDBC Driver → MySQL
    ```

- `JDBC.java` DriverManager 직접 사용 코드 예시     
    ```java
    package localhost.myapp.ex;

    // 서블릿을 특정 URL 패턴("/ex/jdbc")에 매핑
    // 브라우저에서 http://localhost:8080/yourapp/ex/jdbc 로 접근 가능
    @WebServlet("/ex/jdbc")
    public class JDBC extends HttpServlet {

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                throws ServletException, IOException {

            // -----------------------------
            // 1. DB 접속 정보 설정
            // -----------------------------
            // JDBC URL: "mysql://주소:포트/DB명"
            // localhost → 로컬 MySQL 서버
            // 3306 → MySQL 기본 포트
            // test → 사용할 데이터베이스 이름
            String url = "jdbc:mysql://localhost:3306/test";

            // MySQL 사용자 계정
            String user = "test";

            // MySQL 비밀번호
            String pass = "test1234";


            // -----------------------------
            // 2. DB 연결 시도
            // -----------------------------
            // try-with-resources 구문:
            // Connection 객체가 자동으로 close() 되므로 매우 안전한 방식
            try (Connection con = DriverManager.getConnection(url, user, pass)) {

                // 연결 성공 시 콘솔 출력
                System.out.println("연결 성공!");

            } catch (SQLException e) {
                // 연결 실패 시 예외 출력
                e.printStackTrace();
            }
        }
    }
    ```
- 특징
    | 항목                | 내용                       |
    | ----------------- | ------------------------ |
    | **연결 방식**         | 필요할 때마다 새로 Connection 생성 |
    | **속도**            | 느림 (매번 연결하므로)            |
    | **적합한 상황**        | 소규모 프로그램, 학습용            |
    | **스레드 풀**         | 없음                       |
    | **장점**            | 단순, 설정 필요 없음             |

- VSCode 단축키

    - `Shift` + `Alt` + `O` = 자동 Import 

    - `Ctrl` + `Click` = 정의된 곳으로 이동


## 2. MySQL + DataSource (Connection Pool 사용)
> 현업과 Tomcat 환경에서는 아래처럼 사용합니다.

- JNDI API 를 이용해서 문자열 이름으로 서버(WAS)에 등록된 리소스를 찾음.
    > JNDI = 서버(WAS)에 등록된 리소스를 Java 코드에서 이름으로 찾아서 쓰는 방식. 주로 DataSource(커넥션 풀)를 가져오기 위해 사용한다.

- 구조

    ```
    Java → JNDI lookup → Connection Pool(DataSource) → MySQL
    ```

    즉, Java 코드에서 이렇게 하면:

    ```java
    DataSource ds = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/MyDB");
    ```

    Tomcat `Context` 안에 `<Resource name="jdbc/MyDB" .../>` 에 해당하는 리소스를 가져옴. ( `java:comp/env` 는 고정값 )
    ```xml
    <Resource
        name="jdbc/MyDB"
        auth="Container"
        type="javax.sql.DataSource"
        driverClassName="com.mysql.cj.jdbc.Driver"
        url="jdbc:mysql://localhost:3306/test?useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=Asia/Seoul"
        username="test"
        password="test1234"
        maxTotal="30"
        maxIdle="10"
        maxWaitMillis="10000"
        validationQuery="SELECT 1"
    />       
    ```
    `web.xml` ( 선택: IDE 에서 경고가 뜨면 추가설정 )
    > IDE 에서 경고가 뜨면 JNDI 리소스를 인식하도록 `resource-ref` 를 선언해서 알려주면 경고가 사라짐.
    ```xml
    <!-- 톰캣 JNDI DataSource 참조 (이름 반드시 일치) -->
    <resource-ref>
        <description>MySQL Connection Pool</description>
        <res-ref-name>jdbc/MyDB</res-ref-name>
        <res-type>javax.sql.DataSource</res-type>
        <res-auth>Container</res-auth>
    </resource-ref>
    ```

- 코드 예시 (Tomcat JNDI)

    - `JNDI.java`
        ```java
        package localhost.myapp.ex;

        @WebServlet("/ex/jndi")   // "/ex/jndi" URL로 들어오면 이 서블릿이 실행됨
        public class JNDI extends HttpServlet {

            @Override
            protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                    throws ServletException, IOException {

                Context init;  // JNDI 초기 컨텍스트 객체 변수 선언

                try {
                    // ---------------------------------------
                    // 1. InitialContext 생성
                    //    → JNDI 이름공간(java:comp/env/)에 접근할 수 있는 시작점
                    // ---------------------------------------
                    init = new InitialContext();

                    // ---------------------------------------
                    // 2. JNDI로 등록된 DataSource 조회
                    //    "java:comp/env/" 는 표준 고정 경로
                    //    "jdbc/MyDB" 는 ROOT.xml에 설정한 자원 이름
                    //
                    //    즉:
                    //    <Resource name="jdbc/MyDB" ... /> ← 이걸 lookup 하는 것
                    // ---------------------------------------
                    DataSource ds = (DataSource) init.lookup("java:comp/env/jdbc/MyDB");

                    // ---------------------------------------
                    // 3. DataSource 로부터 DB Connection 획득
                    //    try-with-resources 를 쓰면 자동으로 close() 호출됨
                    // ---------------------------------------
                    try (Connection con = ds.getConnection()) {
                        System.out.println("DataSource 연결 성공!");
                    } catch (SQLException e) {
                        // DB 연결 관련 오류 처리
                        e.printStackTrace();
                    }

                } catch (NamingException e) {
                    // JNDI lookup 실패 시 예외 처리
                    e.printStackTrace();
                }
            }
        }

        ```


        - JNDI lookup 과정 튜닝하기 
            > JNDI란 이름으로 리소스를 찾아 사용하는 표준 API

            `/common/DB.java`

            ```java
            package localhost.myapp.common;

            /**
            * JNDI 기반 DataSource 헬퍼 클래스
            *
            * 역할
            * - 톰캣(JNDI)에 등록된 커넥션 풀(javax.sql.DataSource)을 애플리케이션 전역에서
            * 하나의 정적(static) 인스턴스로 공유한다.
            * - DB 연결은 ds.getConnection() 으로 필요할 때마다 풀에서 빌려 쓰는 방식.
            *
            * 특징
            * - static 초기화 블록에서 딱 한 번 lookup → 캐시
            * - 스레드 안전: JVM이 클래스 로딩 시 static 블록을 단 한 번만 실행하도록 보장
            * - final 키워드로 DataSource 인스턴스 불변성 확보
            */
            public class DB {

                /**
                * 톰캣에서 제공하는 DataSource(커넥션 풀) 객체
                *
                * - final: 초기화 이후 값 변경 불가
                * - static: 애플리케이션 전역에서 단 하나의 인스턴스만 사용
                */
                private static final DataSource ds;

                /**
                * static 초기화 블록
                *
                * 동작
                * - 클래스가 JVM에 의해 처음 로딩될 때 단 한 번 실행됨
                * - 여기서 JNDI Lookup을 수행하여 DataSource를 찾고 캐싱함
                *
                * 장점
                * - 스레드-세이프 (JVM 보장)
                * - DB 설정 오류가 있으면 애플리케이션 초기 구동 단계에서 바로 예외 발생 → 문제 조기 발견
                */
                static {
                    try {
                        // 톰캣이 제공하는 JNDI 초기 컨텍스트
                        Context ctx = new InitialContext();

                        /**
                        * JNDI Lookup
                        *
                        * "java:comp/env/" :
                        * 웹 애플리케이션 전용 JNDI 네임스페이스
                        *
                        * "jdbc/MyDB" :
                        * context.xml 또는 server.xml에 아래처럼 선언한 Resource 이름
                        *
                        * <Resource name="jdbc/MyDB"
                        * type="javax.sql.DataSource"
                        * ... />
                        */
                        ds = (DataSource) ctx.lookup("java:comp/env/jdbc/MyDB");

                    } catch (Exception e) {
                        /**
                        * Lookup 실패 시 발생 가능한 예외
                        * - NameNotFoundException : Resource 이름이 틀렸거나 바인딩되지 않았을 때
                        * - NoInitialContextException : 컨테이너(JNDI)가 없는 환경에서 실행될 때
                        *
                        * 예외 발생 시 애플리케이션 초기화 자체를 중단시키는 것이 좋음
                        * → DB 연결이 필수인 웹앱의 경우 조기 실패(Fail Fast) 전략이 안정적
                        */
                        throw new RuntimeException("JNDI DataSource lookup failed: jdbc/MyDB", e);
                    }
                }

                /**
                * 유틸리티 클래스이므로 인스턴스 생성 금지
                * (new DB() 하지 못하도록 막음)
                */
                private DB() {
                }

                /**
                * DataSource 전역 접근자
                *
                * @return 톰캣이 관리하는 커넥션 풀 객체(DataSource)
                *
                *         사용 예:
                *         try (Connection con = DB.getDataSource().getConnection()) {
                *         // SQL 작업 수행
                *         }
                */
                public static DataSource getDataSource() {
                    return ds;
                }
            }
            ```

        - `DB.java` 를 이용하여 변경된 `JNDI.java` 파일
        
            ```java
            package localhost.myapp.ex;

            @WebServlet("/ex/jndi")
            public class JNDI extends HttpServlet {

                private final DataSource ds = DB.getDataSource(); // DB.getDataSource()로 커넥션 풀 객체 생성

                @Override
                protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

                    try (Connection con = ds.getConnection();) {

                        System.out.println("DataSource 연결 성공!");
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
            }
            ```

## 3. JNDI(DataSource) → Connection 얻기 → `PreparedStatement` 로 `준비` 하고 SQL 실행

> DataSource(커넥션 풀)에서 Connection 을 얻었으면, 실제로 SQL을 실행할 때 반드시 알아야 하는 것이 `PreparedStatement`이다. 

> `PreparedStatement`는 단순히 "sql 문자열 실행"이 아니라, SQL 주입 방지, 바인딩, 속도 최적화 등 실무에서 필수 기능을 제공한다.

- ### PreparedStatement 핵심 5가지
    > 아래 5가지만 정확히 이해하면 실무 DAO 코드에서 막히는 일이 거의 없다.

    1. SQL 에서 `?` (placeholder) 를 사용해 바인딩을 한다.

        ```java
        String sql = "SELECT * FROM user WHERE id=? or idx=?";
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setString(1, "test");
        ps.setInt(2, 1);
        ```
        - 숫자는 1부터 시작

        - SQL 의 각 ? 위치와 1:1 매칭됨

        - 타입에 따라 `setString`, `setInt`, `setBoolean` 등을 사용

    2. SQL Injection(주입 공격)을 원천적으로 방지한다
        ```java
        String id = req.getParameter("id");
        String sql = "SELECT * FROM user WHERE id='" + id + "'";
        ```
        > PreparedStatement는 아예 SQL과 값이 분리됨 → 공격이 불가능함.
        ```java
        String id = req.getParameter("id");
        String sql = "SELECT * FROM user WHERE id=?";
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setString(1, id);
        ```

    3. SQL 은 미리 컴파일되고, 바인딩 값만 나중에 들어간다
        > PreparedStatement의 중요한 특성:
        ```java
        (1) SQL 컴파일 → (2) 값 바인딩 → (3) 실행
        ```
        - 동일한 SQL을 여러 번 실행하는 경우, DB가 컴파일된 실행 계획을 재사용하므로 Statement보다 빠르다.

        - 특히 대량 INSERT, 대량 UPDATE 에서 큰 차이가 난다.

    4. SQL 실행 메서드 2가지만 기억하면 됩니다. **( 중요 )**
        > PreparedStatement는 아래 2개만 제대로 쓰면 된다.

        | 메서드               | 용도                                       |반환|
        | ----------------- | ---------------------------------------- |---|
        | `executeQuery()`  | SELECT 조회 → `ResultSet` 객체 반환  | `ResultSet` |
        | `executeUpdate()` | INSERT, UPDATE, DELETE → 영향을 받은 row 수 반환 ( 예: 1,2,3 ) | `Int` |

        - `execute()` 메서드도 있지만, 실무에서는 `executeQuery` / `executeUpdate` 두 개만 쓰는 습관을 들이면 된다.

    5. `try-with-resources` 방식과 함께 사용하면 자동 close 된다
        ```java
        try (
            Connection con = ds.getConnection();
            PreparedStatement ps = con.prepareStatement("select * from user;")
        ) {
            ...
        }
        ```
        > try 괄호 안에 들어가 있기 때문에:

        - con 자동 close

        - ps 자동 close
        - 리소스 누수 방지
        - 톰캣 커넥션 풀 반환(반드시 close 되어야 pool 반환됨)
        - 예외 발생해도 자동 close
        
- ### `ResultSet` 이란? ( 중요 )
    > SELECT 결과를 행(row) 단위로 순회하면서 값을 꺼내는 커서(cursor)

    - `rs` (ResultSet)도 자동 close하려면 내부에 또 try 추가
    - 예시)

        ```java
        try (
            Connection con = ds.getConnection(); // Data Source Connection Pool 에서 Connection 가져옴
            PreparedStatement ps = con.prepareStatement("select * from user;") // SQL 실행준비
        ) {

            try (ResultSet rs = ps.executeQuery()) { // SELECT 실행 → 결과 집합(ResultSet) 반환 → 커서가 첫 행 이전에 위치
                ...
            }
        }
        ```
        

    
        예를들어, `ResultSet rs` 에는
        ```
        | idx | id  | email                     | 
        | --- | --- | ------------------------- | <-- 커서는 첫 행 이전(before first row) 에 위치함.
        | 1   | kim | [a@a.com](mailto:a@a.com) | <-- 첫번째 rs.next();
        | 2   | lee | [b@b.com](mailto:b@b.com) | <-- 두번째 rs.next();
        ```
        - `rs.next()` 이동 성공 시 `true` 값 반환

        - `rs.next()` 이동할 행이 없으면 `false` 값 반환

    - 코드 예시

        ```java
        while (rs.next()) {
            int idx = rs.getInt("idx"); // 컬럼명 기반 조회
            String id = rs.getString("id"); // 컬럼명 기반 조회
        }
        ```

    - 중요한 점  
        - 결과가 한 번에 전부 자바 메모리로 들어오는 게 아니라, DB ↔ JDBC 드라이버 ↔ 자바 사이에서 **필요한 행(row)을 순서대로 가져오면서 읽는 느낌**이다.  

        - 그래서 `while (rs.next())` 로 한 줄씩 이동하면서 읽는다고 보면 된다.




- ### Select  전체 예시

    `SQLtest.java`
    ```java
    package localhost.myapp.ex;

    /**
    * /ex/sql 요청이 들어오면 MySQL의 user 테이블을 조회하여
    * 콘솔에 결과를 출력하는 테스트 서블릿
    */
    @WebServlet("/ex/sql")
    public class SQLTest extends HttpServlet {

        // 톰캣에 등록된 DBCP(Connection Pool) 객체 가져오기 (싱글톤 캐싱)
        private final DataSource ds = DB.getDataSource();

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

            select_test();
            // insert_test();

        }

        // private void insert_test() {

        // String sql = "insert into `test`.`board` (`title`, `content`) values (?,?);";

        // try (Connection con = ds.getConnection(); // 1) 커넥션 풀에서 Connection 가져오기
        // PreparedStatement ps = con.prepareStatement(sql) // 2) PreparedStatement 생성
        // ) {

        // System.out.println("DataSource 연결 성공!");

        // // SQL의 첫 번째 ? 에 값 바인딩
        // ps.setString(1, "제목11");
        // ps.setString(2, "내용22");

        // int flag = ps.executeUpdate();
        // System.out.println("=== MYSQL executeUpdate 실행결과 : " + flag + "개 성공 ===");

        // } catch (SQLException e) {
        // // DB 관련 예외 발생 시 스택 출력
        // e.printStackTrace();
        // }

        // }

        private void select_test() {

            // 파라미터 바인딩이 필요한 SQL
            String sql = "SELECT * FROM user WHERE id = ?";

            /**
            * try-with-resources
            * - Connection, PreparedStatement 객체를 자동으로 close()
            * - DB 리소스는 반드시 닫아야 하므로 이런 방식이 가장 안전함
            */
            try (Connection con = ds.getConnection(); // 1) 커넥션 풀에서 Connection 가져오기
                    PreparedStatement ps = con.prepareStatement(sql) // 2) PreparedStatement 생성
            ) {
                System.out.println("DataSource 연결 성공!");

                // SQL의 첫 번째 ? 에 값 바인딩
                ps.setString(1, "test");

                /**
                * ResultSet 역시 닫아야 하는 자원이므로
                * 별도의 try-with-resources 블록으로 묶음
                */
                try (ResultSet rs = ps.executeQuery()) { // SELECT 실행 → 결과 집합 반환

                    // 실행된 결과셋(ResultSet)의 메타데이터 (컬럼명, 타입 등 정보)
                    ResultSetMetaData meta = rs.getMetaData();
                    int columnCount = meta.getColumnCount(); // 전체 컬럼 수

                    System.out.println("=== MYSQL TABLE 메타데이터 ===");
                    // 1번 컬럼부터 columnCount까지 반복
                    System.out.print("| ");
                    for (int i = 1; i <= columnCount; i++) {
                        String colName = meta.getColumnLabel(i); // SELECT 결과의 컬럼명
                        String colType = meta.getColumnTypeName(i);
                        System.out.print(colName + "(" + colType + ")" + " | ");
                    }
                    System.out.println("");

                    // 결과가 여러 줄일 수도 있으므로 while 사용
                    while (rs.next()) {
                        System.out.println("=== MYSQL TABLE 행 ===");

                        // 1번 컬럼부터 columnCount까지 반복
                        for (int i = 1; i <= columnCount; i++) {
                            String colName = meta.getColumnLabel(i); // SELECT 결과의 컬럼명
                            Object value = rs.getObject(i); // 해당 컬럼의 값
                            System.out.println(colName + ": " + value);
                        }

                        System.out.println("=======================");
                    }
                }

            } catch (SQLException e) {
                // DB 관련 예외 발생 시 스택 출력
                e.printStackTrace();
            }

        }
    }
    ```

## 💡 **요약정리**  

- `DB.java` 에서 `JNDI` 로 `DataSource` 를 찾는다.

    ```java
    private final DataSource ds = DB.getDataSource();
    ```

- `DataSource Connection Pool` 에서 `Connection` 을 얻는다.
    ```java
    Connection con = ds.getConnection(); // Data Source 커넥션 풀에서 DB 연결(Connection) 하나 가져오기
    ```

- `PreparedStatement` 로 쿼리문을 세팅한다.

    ```java
    PreparedStatement ps = con.prepareStatement("select * from user where idx = ?"); // SQL을 미리 준비(컴파일)해 두는 객체 → ? 자리 값 바인딩 가능
    ```

- 쿼리 실행 결과를 `ResultSet` 에 담는다.
    ```java
    ResultSet rs = ps.executeQuery(); // SELECT 실행 → ResultSet 형태로 반환 → 커서가 첫 행 이전에 위치
    ```

- SELECT 결과를 행(row) 단위로 순회하면서 값을 꺼낸다.

    ```java
    while (rs.next()) {
        int idx = rs.getInt("idx"); // 컬럼명 기반 조회
        String id = rs.getString("id"); // 컬럼명 기반 조회
    }
    ```

## 🧩 실습 / 과제
- 원하는 쿼리문과 함께 결과물 로그로 출력해 보기     

    예시) 
    ```sql
    SELECT * FROM `test`.`board` where `idx` = 1
    ```

- INSERT, UPDATE 를 `executeUpdate()` 를 사용하여 해보기

    예시)
    ```sql
    insert into `test`.`board` (`title`, `content`) values ("제목", "내용");
    ```


- `User` 테이블 select_user 메서드로 만들어서 출력하기