# Servlet Filter(필터) 와 Listener(리스너) 구현

## 📘 학습 개요
필터와 리스너를의 역할을 알아보고 구현하기


## 💡 주요 내용

- Servlet Filter(필터) 역할과 구현방법

- Servlet Listener(리스너) 역할와 구현방법

---
## 1. Servlet Filter(필터)
> 웹 애플리케이션에서 요청과 응답이 서블릿이나 JSP에 도달하기 전 또는 후에 가로채서 처리할 수 있는 기능입니다. 로그인 체크, 인코딩 설정, 로깅, 권한 확인 등 공통적인 작업에 많이 활용됩니다.

1. 필터 란?

    - 클라이언트 → 요청(Request)

    - 필터가 먼저 요청을 가로챔

    - 필요한 전처리 수행 (예: 인코딩, 로그인 확인 등)

    - 서블릿 또는 JSP로 전달

    - 서블릿 실행 후 응답(Response)

    - 다시 필터가 응답을 가공할 수 있음

        > **즉, 필터는 “요청과 응답 사이를 감시하고 변환할 수 있는 중간 처리자”** 입니다.

2. 필터 사용 ( 예: 인코딩 처리 )

    1. `EncodingFilter.java`
        ```java
        package localhost.myapp.filter;

        import jakarta.servlet.*;
        import jakarta.servlet.annotation.WebFilter;
        import java.io.IOException;

        @WebFilter("/*") // 모든 요청에 필터 적용
        public class EncodingFilter implements Filter {

            @Override
            public void init(FilterConfig filterConfig) throws ServletException {
                System.out.println("EncodingFilter 초기화");
            }

            @Override
            public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
                    throws IOException, ServletException {

                // 1) 요청(request)에 UTF-8 인코딩 설정
                req.setCharacterEncoding("UTF-8");
                System.out.println("EncodingFilter: 요청 인코딩 UTF-8 설정");

                // 2) 다음 필터 또는 서블릿으로 요청 전달
                chain.doFilter(req, resp);

                // 3) 응답(response) 후처리 (필요하면)
                System.out.println("EncodingFilter: 응답 처리 후 단계");
            }

            @Override
            public void destroy() {
                System.out.println("EncodingFilter 종료");
            }
        }
        ```

    2. 실행 흐름
        ```
        요청(Request)
            ↓
        [EncodingFilter] → 요청(request)에 UTF-8 인코딩 설정
            ↓
        @WebServlet → 실제 컨트롤러 코드 실행 ( 이제 더이상 setCharacterEncoding("UTF-8") 설정 안해도 됨 )
            ↓
        JSP 렌더링
            ↓
        [EncodingFilter] → Log 에 "EncodingFilter: 응답 처리 후 단계" 찍힘
            ↓
        응답(Response)
        ```

    3. http://jsp.servlet.localhost:8081/ex/life 접속해서 터미널 로그로 확인 
    
## 2. Servlet Listener(리스너)
> 웹 애플리케이션의 생명주기나 특정 이벤트를 감지해서 자동으로 실행되는 객체예요.

1. 리스너 란?

    > 관리할 수 있는 이벤트는 크게 3종류입니다:

    | 이벤트 종류            | 예시             | 실행 시기                    |
    | ----------------- | -------------- | ------------------------ |
    | **서버 시작/종료**      | 서버 켜질 예비 준비 코드 | 웹 애플리케이션 시작/종료           |
    | **세션 생성/삭제**      | 로그인 시 세션 생성될 때 | HttpSession 생성/소멸        |
    | **request 생성/종료** | 요청이 들어올 때      | 요청(request)이 들어오고 응답 후 끝 |

    > 이를 처리하기 위해 제공하는 인터페이스는 아래와 같아요 👇

    | 인터페이스                    | 역할                |
    | ------------------------ | ----------------- |
    | `ServletContextListener` | 웹 애플리케이션 시작/종료 감지 |
    | `HttpSessionListener`    | 세션 생성/소멸 감지       |
    | `ServletRequestListener` | 요청 시작/종료 감지       |


2. 리스터 사용 ( 애플리케이션 + 세션 + 요청 감지 )

    `MyListener.java`

    ```java
    package localhost.myapp.listener;

    import jakarta.servlet.*;
    import jakarta.servlet.annotation.WebListener;
    import jakarta.servlet.http.*;

    @WebListener
    public class MyListener implements ServletContextListener, HttpSessionListener, ServletRequestListener {

        // 웹 애플리케이션 시작/종료
        @Override
        public void contextInitialized(ServletContextEvent sce) {
            System.out.println("🌐 애플리케이션 시작됨!");
        }

        @Override
        public void contextDestroyed(ServletContextEvent sce) {
            System.out.println("🌐 애플리케이션 종료됨!");
        }

        // 세션 생성/소멸
        @Override
        public void sessionCreated(HttpSessionEvent se) {
            System.out.println("👤 세션 생성: " + se.getSession().getId());
        }

        @Override
        public void sessionDestroyed(HttpSessionEvent se) {
            System.out.println("👤 세션 소멸: " + se.getSession().getId());
        }

        // 요청(request) 시작/종료
        @Override
        public void requestInitialized(ServletRequestEvent sre) {
            HttpServletRequest req = (HttpServletRequest) sre.getServletRequest();
            String url = req.getRequestURL().toString();     // 전체 URL
            //String uri = req.getRequestURI();                // URI만
            String query = req.getQueryString();             // 쿼리 파라미터
            String clientIp = req.getRemoteAddr();           // 요청 보낸 IP

            System.out.println("➡ 요청 들어옴: " + url +
                    (query != null ? "?" + query : "") +
                    " | IP: " + clientIp);
        }

        @Override
        public void requestDestroyed(ServletRequestEvent sre) {
            System.out.println("⬅ 요청 처리 완료");
        }
    }

    ```

3. 사용 시나리오

    | 상황             | 적용 예                   |
    | -------------- | ---------------------- |
    | 애플리케이션 최초 실행 시 | DB 연결 풀 준비, 설정 파일 읽기   |
    | 세션 생성 시        | 로그인 로그 기록, 방문자 수 증가    |
    | 요청마다 자동 실행     | 접속자 IP 로그, 요청 소요 시간 측정 |
    | 종료 시           | 자원 반납, 로그 저장           |

4. http://jsp.servlet.localhost:8081/ex/life 접속해서 터미널 로그로 확인


## 💡 **요약정리**  

> **Filter(필터)** 는 요청과 응답 사이를 가로채서 전·후 처리(검열, 인코딩, 인증 등) 하는 중간 관리자.

> **Listener(리스너)** 는 웹 애플리케이션, 세션, 요청 등의 생명주기 이벤트를 감지하여 자동으로 실행되는 감시자.