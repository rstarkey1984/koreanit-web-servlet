package ex;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;
import java.util.StringJoiner;
// import jakarta.servlet.annotation.*; // @WebServlet 같은 어노테이션 사용을 위해 필요

/**
 * LifeCycleServlet
 *
 * 목적:
 *  - Servlet 생명주기(init -> service -> doGet/doPost -> destroy) 흐름을 로그로 명확히 보여준다.
 *  - HttpServletRequest에 들어있는 각종 정보(요청라인, 헤더, 파라미터, 쿠키, 세션, 바디)를 한 페이지로 출력한다.
 *  - HttpServletResponse로 응답을 구성하는 방법(상태코드, 헤더, 쿠키, 본문, 리다이렉트, 에러)을 한 곳에서 실습한다.
 *
 * 테스트 팁(예시 URL은 컨텍스트 루트에 따라 조정):
 *  - GET 기본:              /life
 *  - 리다이렉트:            /life?action=redirect&to=/life
 *  - 에러 응답:             /life?action=error&code=403&msg=Forbidden
 *  - 쿠키 설정:             /life?setCookie=hello:world (다음 요청에서 쿠키 수신 확인)
 *  - POST JSON 바디 미리보기: curl -X POST -H "Content-Type: application/json" -d '{"a":1}' http://localhost/life
 *
 * 주의:
 *  - 이 클래스는 @WebServlet 대신 web.xml로 매핑해도 되고, @WebServlet("/ex/life")를 붙여도 된다.
 *  - Tomcat 10+ (jakarta.* 네임스페이스) 기준.
 */

//@WebServlet("/ex/life")
public class LifeCycleServlet extends HttpServlet {

    /**
     * init()
     * - 서블릿 인스턴스가 생성된 직후 "최초 1회" 호출되는 초기화 메서드.
     * - DB 커넥션 풀 준비, 설정값 로드 등 초기 작업을 수행하기 좋다.
     */
    @Override
    public void init() throws ServletException {
        System.out.println("[LifeCycleServlet] init() - " + LocalDateTime.now());
    }

    /**
     * service()
     * - 모든 HTTP 요청을 가장 먼저 받는 메서드.
     * - 여기서 doGet(), doPost() 등으로 분기되며, super.service()가 그 역할을 수행한다.
     * - 로그를 남겨 요청 흐름(메서드/URI/시간)을 확인할 수 있게 한다.
     */
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        System.out.println("[LifeCycleServlet] service() - "
                + req.getMethod() + " " + req.getRequestURI()
                + " @ " + LocalDateTime.now());

        // 중요: 부모의 service()를 호출해야 doGet/doPost가 정상적으로 실행된다.
        super.service(req, resp);
    }

    /**
     * doGet()
     * - 요청 정보(HttpServletRequest) 상세를 모아서 텍스트로 출력.
     * - 응답(HttpServletResponse) 구성(상태/헤더/쿠키/본문) 예시도 포함.
     * - 쿼리 파라미터로 특수 동작을 제공:
     *     ?action=redirect&to=/life     -> sendRedirect 테스트
     *     ?action=error&code=400&msg=.. -> sendError 테스트
     *     ?setCookie=foo:bar            -> 응답 쿠키 설정
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        // -------------------- (1) 응답 메타 구성 --------------------
        // 출력 인코딩 및 MIME 설정(Writer 사용 시 인코딩 일치 필수)
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("text/plain; charset=UTF-8");

        // 커스텀 헤더 추가 예시
        resp.setHeader("X-Example", "LifeCycleServlet");

        // 쿼리로 쿠키 설정(?setCookie=key:value)
        String cookieParam = req.getParameter("setCookie");
        if (cookieParam != null && cookieParam.contains(":")) {
            String[] kv = cookieParam.split(":", 2);
            Cookie c = new Cookie(kv[0], kv[1]);
            c.setPath("/");          // 애플리케이션 전체 경로에서 유효
            c.setHttpOnly(true);     // JS 접근 차단(보안)
            // c.setSecure(true);    // HTTPS에서만 전송(환경에 맞게)
            c.setMaxAge(60 * 10);    // 10분
            resp.addCookie(c);
        }

        // -------------------- (2) 특수 동작: 리다이렉트/에러 --------------------
        String action = req.getParameter("action");
        if ("redirect".equalsIgnoreCase(action)) {
            // 리다이렉트 URL이 없으면 기본은 /life로 보냄
            String to = req.getParameter("to");
            resp.sendRedirect(to != null ? to : req.getContextPath() + "/life");
            return; // 리다이렉트로 응답 완료
        } else if ("error".equalsIgnoreCase(action)) {
            // 에러 코드/메시지 전송 (예: 400, 403 등)
            int code = parseIntOrDefault(req.getParameter("code"), 400);
            String msg = req.getParameter("msg");
            if (msg != null) resp.sendError(code, msg);
            else resp.sendError(code);
            return; // 에러로 응답 완료
        }

        // -------------------- (3) 요청 정보 수집 --------------------
        StringBuilder out = new StringBuilder(8_192);

        out.append("=== Java Servlet Request/Response Deep-Dive ===\n\n");
        out.append("# Time\n")
           .append("now: ").append(LocalDateTime.now()).append('\n')
           .append('\n');

        // A. 요청 라인/경로 관련
        out.append("# Request Line\n");
        out.append("method           : ").append(req.getMethod()).append('\n');       // GET/POST/...
        out.append("protocol         : ").append(req.getProtocol()).append('\n');     // HTTP/1.1
        out.append("scheme           : ").append(req.getScheme()).append('\n');       // http/https
        out.append("requestURI       : ").append(req.getRequestURI()).append('\n');   // /life
        out.append("requestURL       : ").append(req.getRequestURL()).append('\n');   // http://host/life
        out.append("queryString      : ").append(nullToEmpty(req.getQueryString())).append('\n');
        out.append("contextPath      : ").append(req.getContextPath()).append('\n');  // 컨텍스트 루트
        out.append("servletPath      : ").append(req.getServletPath()).append('\n');  // 서블릿 매핑 경로
        out.append("pathInfo         : ").append(nullToEmpty(req.getPathInfo())).append('\n');
        out.append("pathTranslated   : ").append(nullToEmpty(req.getPathTranslated())).append('\n');
        out.append('\n');

        // B. 서버/로컬/클라이언트 정보
        out.append("# Endpoints\n");
        out.append("serverName       : ").append(req.getServerName()).append('\n');
        out.append("serverPort       : ").append(req.getServerPort()).append('\n');
        out.append("localAddr        : ").append(req.getLocalAddr()).append('\n');
        out.append("localName        : ").append(req.getLocalName()).append('\n');
        out.append("localPort        : ").append(req.getLocalPort()).append('\n');
        out.append("remoteAddr       : ").append(req.getRemoteAddr()).append('\n');   // 클라이언트 IP
        out.append("remoteHost       : ").append(req.getRemoteHost()).append('\n');
        out.append("remotePort       : ").append(req.getRemotePort()).append('\n');
        out.append('\n');

        // C. 헤더들
        out.append("# Headers\n");
        Enumeration<String> headerNames = req.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String h = headerNames.nextElement();
            out.append(h).append(": ").append(req.getHeader(h)).append('\n');
        }
        out.append('\n');

        // D. 콘텐츠/로케일/인코딩
        out.append("# Content/Locale\n");
        out.append("contentType      : ").append(nullToEmpty(req.getContentType())).append('\n');
        out.append("contentLength    : ").append(req.getContentLength()).append('\n');
        out.append("characterEncoding: ").append(nullToEmpty(req.getCharacterEncoding())).append('\n');
        out.append("Locales (Accept-Language): ");
        StringJoiner locJoiner = new StringJoiner(", ");
        Enumeration<Locale> locales = req.getLocales();
        while (locales.hasMoreElements()) locJoiner.add(locales.nextElement().toLanguageTag());
        out.append(locJoiner.length() == 0 ? "(none)" : locJoiner.toString()).append('\n');
        out.append('\n');

        // E. 파라미터(쿼리/폼) — 다중값 포함
        out.append("# Parameters\n");
        Map<String, String[]> pmap = req.getParameterMap();
        if (pmap.isEmpty()) {
            out.append("(no parameters)\n");
        } else {
            for (Map.Entry<String, String[]> e : pmap.entrySet()) {
                out.append(e.getKey()).append(" = ");
                StringJoiner sj = new StringJoiner(", ");
                for (String v : e.getValue()) sj.add(v);
                out.append('[').append(sj.toString()).append(']').append('\n');
            }
        }
        out.append('\n');

        // F. 쿠키
        out.append("# Cookies\n");
        Cookie[] cookies = req.getCookies();
        if (cookies == null || cookies.length == 0) {
            out.append("(no cookies)\n");
        } else {
            for (Cookie c : cookies) {
                out.append(c.getName()).append('=').append(c.getValue())
                   .append(" ; Path=").append(c.getPath())
                   .append(" ; HttpOnly=").append(c.isHttpOnly())
                   .append(" ; MaxAge=").append(c.getMaxAge())
                   .append('\n');
            }
        }
        out.append('\n');

        // G. 세션
        out.append("# Session\n");
        // true: 세션이 없으면 새로 생성. false: 없으면 null 반환.
        HttpSession session = req.getSession(true);

        // 방문 카운터 (세션 유지 예시)
        Integer visit = (Integer) session.getAttribute("sess.visit");
        if (visit == null) visit = 0;
        session.setAttribute("sess.visit", ++visit);

        out.append("sessionId        : ").append(session.getId()).append('\n');
        out.append("isNew            : ").append(session.isNew()).append('\n');        
        out.append("creationTime     : ").append(session.getCreationTime()).append('\n');        
        out.append("lastAccessedTime : ").append(session.getLastAccessedTime()).append('\n');
        out.append("maxInactiveInterval(s): ").append(session.getMaxInactiveInterval()).append('\n');        
        // 샘플 세션 속성 저장/조회
        if (session.getAttribute("visitedAt") == null) {
            session.setAttribute("visitedAt", LocalDateTime.now().toString());
        }
        out.append("attr.visitedAt   : ").append(String.valueOf(session.getAttribute("visitedAt"))).append('\n');
        out.append("sess.visit       : ").append(session.getAttribute("sess.visit")).append('\n');
        out.append('\n');

        // H. 바디 미리보기 (GET은 보통 바디가 없지만 예외 처리)
        out.append("# Body (first 2048 bytes if present)\n");
        if (req.getContentLength() > 0 || req.getHeader("Transfer-Encoding") != null) {
            // 텍스트/바이너리 모두 대응하는 헬퍼 사용
            out.append(readBodyPreview(req)).append('\n');
        } else {
            out.append("(no body)\n");
        }
        out.append('\n');

        // -------------------- (4) 응답 본문/상태 전송 --------------------
        resp.setStatus(HttpServletResponse.SC_OK); // 200

        // 텍스트 본문은 Writer로 전송(인코딩 주의)
        try (PrintWriter pw = resp.getWriter()) {
            pw.print(out.toString());
            pw.println("# Response Tips");
            pw.println("- resp.setStatus(int), setHeader(String,String), addCookie(Cookie)");
            pw.println("- resp.sendRedirect(url) for redirect");
            pw.println("- resp.sendError(code[, message]) for error");
            pw.println("- resp.getWriter() for text, resp.getOutputStream() for binary");
            pw.flush();
        }

        // 참고) 바이너리 응답 예시(주석)
        // resp.setContentType("application/octet-stream");
        // try (ServletOutputStream os = resp.getOutputStream()) {
        //     os.write(new byte[]{1,2,3,4});
        // }
    }

    /**
     * doPost()
     * - POST 요청에서 파라미터와 바디를 어떻게 다루는지 보여준다.
     * - 컨테이너가 파라미터를 파싱해주는 경우(req.getParameter*)와
     *   Raw Body를 직접 읽는 경우(req.getReader()/getInputStream())의 차이를 함께 출력.
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        // 응답 인코딩/MIME 및 샘플 헤더
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("text/plain; charset=UTF-8");
        resp.setHeader("X-Example", "LifeCycleServlet-POST");

        StringBuilder out = new StringBuilder(4_096);
        out.append("=== POST Received ===\n");
        out.append("contentType      : ").append(nullToEmpty(req.getContentType())).append('\n');
        out.append("characterEncoding: ").append(nullToEmpty(req.getCharacterEncoding())).append('\n');
        out.append("contentLength    : ").append(req.getContentLength()).append("\n\n");

        // 컨테이너가 파싱해준 파라미터(폼/쿼리)
        out.append("# Parameters (parsed by container)\n");
        Map<String, String[]> pmap = req.getParameterMap();
        if (pmap.isEmpty()) out.append("(no parameters)\n");
        else {
            for (Map.Entry<String, String[]> e : pmap.entrySet()) {
                out.append(e.getKey()).append(" = ");
                StringJoiner sj = new StringJoiner(", ");
                for (String v : e.getValue()) sj.add(v);
                out.append('[').append(sj.toString()).append(']').append('\n');
            }
        }
        out.append('\n');

        // Raw Body 미리보기(최대 4096바이트)
        out.append("# Raw Body (first 4096 bytes)\n");
        out.append(readBodyPreview(req, 4096)).append('\n');

        try (PrintWriter pw = resp.getWriter()) {
            pw.print(out.toString());
        }
    }

    /**
     * destroy()
     * - 서블릿이 내려갈 때(컨테이너 종료/언로드) 1회 호출.
     * - 열려있는 리소스 정리, 로그 마무리 등에 사용.
     */
    @Override
    public void destroy() {
        System.out.println("[LifeCycleServlet] destroy() - " + LocalDateTime.now());
    }

    // ==================== 유틸 메서드 ====================

    /** 바디 미리보기(텍스트 우선, 실패 시 바이너리로 헥사 출력) */
    private static String readBodyPreview(HttpServletRequest req) throws IOException {
        return readBodyPreview(req, 2048);
    }

    /** 바디 미리보기(최대 maxBytes 바이트) */
    private static String readBodyPreview(HttpServletRequest req, int maxBytes) throws IOException {
        // 요청 인코딩이 지정되지 않았다면 UTF-8로 설정(일반 텍스트 처리 대비)
        req.setCharacterEncoding(req.getCharacterEncoding() != null
                ? req.getCharacterEncoding()
                : StandardCharsets.UTF_8.name());

        // 1) 문자 스트림으로 시도
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = req.getReader()) {
            int total = 0;
            char[] buf = new char[512];
            int n;
            while ((n = br.read(buf)) != -1 && total < maxBytes) {
                int toAppend = Math.min(n, maxBytes - total);
                sb.append(buf, 0, toAppend);
                total += toAppend;
            }
            // 더 읽을 게 있다면 생략 표기
            if (br.read() != -1) sb.append("\n...[truncated]");
            return sb.toString();
        } catch (IllegalStateException e) {
            // getReader()가 이미 사용되었거나(사양 위반) 바이너리라면 InputStream으로 시도
            StringBuilder hex = new StringBuilder();
            try (ServletInputStream is = req.getInputStream()) {
                int total = 0;
                byte[] b = new byte[512];
                int n;
                while ((n = is.read(b)) != -1 && total < maxBytes) {
                    int toAppend = Math.min(n, maxBytes - total);
                    for (int i = 0; i < toAppend; i++) {
                        hex.append(String.format("%02x ", b[i]));
                    }
                    total += toAppend;
                }
                if (is.read() != -1) hex.append("...[truncated]");
            }
            return "(binary) " + hex.toString();
        }
    }

    /** null 문자열을 빈 문자열로 안전 변환 */
    private static String nullToEmpty(String s) {
        return (s == null) ? "" : s;
    }

    /** 안전한 정수 파싱(실패 시 기본값 반환) */
    private static int parseIntOrDefault(String s, int def) {
        try { return Integer.parseInt(s); } catch (Exception e) { return def; }
    }
}
