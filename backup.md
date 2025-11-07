- Javac 명령어로 컴파일 해서 /WEB-INF/classes 폴더에 넣기
  ``` bash
  javac -cp /usr/share/tomcat10/lib/servlet-api.jar: -d /var/www/<subdomain>.localhost/WEB-INF/classes $(find /var/www/<subdomain>.localhost/WEB-INF/src/ -name "*.java")
  ```
  | 명령어/옵션                                   | 의미                                           |
  | ---------------------------------------- | -------------------------------------------- |
  | `javac`                                  | 자바 소스 파일(.java)을 컴파일하는 명령어                   |
  | `-cp <경로>`                               | 클래스패스(Classpath). 외부 라이브러리 또는 필요한 클래스 위치를 설정 |
  | `/usr/share/tomcat10/lib/servlet-api.jar` | Tomcat의 Servlet API 라이브러리 (서블릿 개발 시 필수)      |
  | `-d <경로>`                                | 컴파일된 `.class` 파일을 저장할 디렉터리 지정                |
  | `$(find <경로> -name "*.java")`            | 지정된 경로에서 모든 `.java` 파일을 찾아서 컴파일 대상으로 전달      |

- Tomcat 실시간 로그 보기 ( 디버깅할때 유용 )
  ```bash
  sudo tail -f /var/log/tomcat10/catalina.out
  ```

- Tomcat 서버 재시작 ( .class 파일이 변경되면 필요 )

  ```bash
  sudo systemd restart tomcat
  ```

- 배포가 완료됐으니 위에서 매핑한것들이 잘 동작하는지 확인

  - 브라우저에서 `web.xml` 매핑으로 작성된 페이지 호출하기 http://<subdomain>.localhost/hello_01

  - 브라우저에서 `@Annotation` 작성된 페이지 호출하기 http://<subdomain>.localhost/hello_02
