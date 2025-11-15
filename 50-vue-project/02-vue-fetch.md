# Fetch를 이용한 API 요청 / 응답


## 📘 학습 개요

브라우저의 Fetch API를 활용하여 서버와 데이터를 주고받는 방법을 익힌다.

프론트엔드(Vue 포함)에서 백엔드(서블릿 API)와 연결되는 전체 흐름을 이해함으로써,

실제 웹 애플리케이션에서 데이터 요청 → 응답 처리 → 화면 렌더링까지의 과정을 실습해본다.

## 💡 주요 내용

- Fetch API란

- 기본 사용법 (GET / POST)

- 구글 뉴스 요청해서 화면에 출력하기


## 1. Fetch API 란?
> Fetch API는 브라우저 안에 기본 탑재된 HTTP 요청(REST API 호출)을 보내기 위한 표준 내장 기능.

- Fetch API 특징 (중요 4개)

    1. Promise 기반

        - 콜백 지옥 없이 .then(), .catch(), 그리고 async/await 사용 가능.

    2) 브라우저 내장

        - 추가 설치 불필요. 프론트엔드라면 그냥 바로 사용.

    3) JSON 변환을 직접 해야 함

        - fetch()는 응답을 그대로 반환하므로 res.json()으로 별도의 파싱을 해줘야 함.

- async/await 버전 (요즘 가장 많이 쓰는 방식)
    ```js
    async function get_board(idx) {
        try {
            idx = idx == null ? "" : "/"+idx;
            const res = await fetch("/api/board"+idx);
            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }
    ```

- 브라우저 콘솔에서
    ```js
    await get_board(); // 게시물 목록 조회
    ```

## 2. 기본 사용법 (GET / POST / PUT / DELETE)
- JSON Body + POST ( 게시물 등록 )

    ```js
    async function post_board(title, content) {
        try {
            const res = await fetch("/api/board/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title:title,
                    content:content
                }),
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }
    ```
    - 브라우저 콘솔에서

        ```js
        await post_board("test", "test123"); // 게시물 등록
        ```

- JSON Body + PUT ( 게시물 수정 )
    ```js
    async function put_board(idx, title, content) {
        try {
            idx = idx == null ? "" : "/"+idx;
            const res = await fetch("/api/board"+idx, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                }),
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }
    ```
    - 브라우저 콘솔에서
        ```js
        await put_board(1, "제목", "내용"); // 게시물 수정
        ```

        ```js
        await get_board(1); // 단건 게시물 조회
        ```

- JSON Body + DELETE
    ```js
    async function delete_board(idx) {
        try {
            idx = idx == null ? "" : "/"+idx;
            const res = await fetch("/api/board"+idx, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }
    ```
    - 브라우저 콘솔에서

        ```js
        await delete_board(1); // 게시물 수정
        ```
    
      

## 3. 구글 뉴스 요청해서 화면에 출력하기

- 구글 뉴스 XML 주소 - https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko

1. 브라우저 콘솔 테스트

    ```js
    async function getNews() {
        const res = await fetch("https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko");
        const data = await res.json();
        console.log(data);
    }
    ```

    ```js
    await getNews();
    ```

    > CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. 오류남

    - **CORS(Cross-Origin Resource Sharing)** 란?

        > "다른 도메인(Origin)끼리 요청을 주고받을 때, 브라우저가 보안 때문에 막아버리는 것을 어떻게 허용할지 정하는 규칙"

        - 즉, 브라우저의 보안 정책이다. 서버 문제도 아니고, 자바/JS 문법 문제도 아니고, 브라우저가 막는 것이다.

        - 브라우저는 원래 Same-Origin Policy(동일 출처 정책) 때문에, 자기 도메인만 요청할 수 있음.

        - 서버가 `A` 인데 Javascript에서 `B` 사이트로 AJAX / fetch 요청 보내면, 
            > “어? 출처가 다르네? 위험해 보이니까 막을게!” 
            
            라고 하는 것이 CORS 에러.

    - **Origin(출처)** 란?

        범위는 3개가 모두 같아야 동일 출처(Same-Origin)

        | 구성   | 예시                      |
        | ---- | ----------------------- |
        | 프로토콜 | http / https            |
        | 도메인  | localhost / example.com |
        | 포트   | 80 / 8080 / 3000        |

        한 개라도 다르면 **Cross-Origin(교차 출처)**


    - 🧩 그럼 **CORS** 는 어떻게 해결되나요?
        > 방법은 서버가 아래와 같은 HTTP 헤더를 응답에 보내주는 것:

        ```
        Access-Control-Allow-Origin: *
        Access-Control-Allow-Methods: GET, POST, PUT, DELETE
        Access-Control-Allow-Headers: Content-Type
        ```
        > 의미는: "브라우저야, 저 출처에서 오는 요청은 안전하니까 허용해도 괜찮아."

    
    - 개발자들이 흔히 겪는 상황
        > Vue / React 개발 서버(3000 or 5173) → 서블릿 API(8080)
        
        프론트 개발 중:
        ```
        http://localhost:5173  →  http://localhost:8080/api/user
        ```
        ➡ 포트가 달라서 무조건 CORS 발생!
        
        이때 서버에서 CORS 허용헤더를 넣어줘야 함.

    - 🛠️ 서블릿에서 CORS 해결 예시(Filter)

        ```java
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        ```

    - 한줄 요약
        > CORS는 브라우저가 다른 출처 간 요청을 막아놓은 보안 정책이며, 서버가 “허용 헤더”를 보내주면 풀린다.

    - 왜 브라우저만 CORS에 걸릴까?
        > “브라우저는 악성 스크립트가 다른 사이트로 마음대로 요청하지 못하게 막아야 한다!”

        그래서 브라우저 내부에 보안장치가 있음 → CORS 에러 발생

## 4. 구글 뉴스 가져오기 위해서 서블릿 코드 작성

> 브라우저 에서 `CORS` 정책 때문에 다른사이트 요청이 안되면, 서버에서 요청을 보내면 된다.

- `src/GoogleNews.java`

- `src/GoogleServlet.java`


1. 브라우저 콘솔 테스트용

    ```js
    async function getNews() {
        const res = await fetch("/news/google-news");
        const data = await res.text();
        console.log(data);
    }
    ```

    ```js
    await getNews();
    ```

2. `/vue-02/news.html` 작성

    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vue + Fetch 구글 뉴스</title>
        <!-- Vue 3 CDN -->
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
            margin: 20px;
        }
        .news-list {
            list-style: none;
            padding: 0;
        }
        .news-item {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .news-title {
            font-weight: 600;
            text-decoration: none;
        }
        .news-title:hover {
            text-decoration: underline;
        }
        .news-source {
            color: #6b7280;
            font-size: 12px;
            margin-left: 4px;
        }
        .news-date {
            color: #9ca3af;
            font-size: 12px;
        }
        .error {
            color: #b91c1c;
        }
        </style>
    </head>
    <body>
        <div id="app">
        <h1>구글 뉴스 (Vue + Fetch)</h1>

        <button @click="fetchNews" :disabled="loading">
            {{ loading ? "로딩 중..." : "뉴스 새로고침" }}
        </button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <ul v-if="newsList.length" class="news-list">
            <li v-for="(item, idx) in newsList" :key="idx" class="news-item">
            <a
                class="news-title"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
            >
                {{ item.title }}
            </a>
            <span class="news-source"> ({{ item.source || "출처 없음" }}) </span>
            <div class="news-date">{{ item.pubDate }}</div>
            </li>
        </ul>

        <p v-else-if="!loading && !errorMessage">표시할 뉴스가 없습니다.</p>
        </div>

        <script>
            const { createApp, ref, onMounted } = Vue;

            createApp({
                setup() {
                    const newsList = ref([]);
                    const loading = ref(false);
                    const errorMessage = ref("");

                    const fetchNews = async () => {
                        loading.value = true;
                        errorMessage.value = "";

                        try {
                            const res = await fetch("/news/google-news");
                            if (!res.ok) {
                                throw new Error("HTTP 오류: " + res.status);
                            }

                            const data = await res.json(); // List<GoogleNews> 배열
                            newsList.value = data;
                        } catch (err) {
                            console.error(err);
                            errorMessage.value = "뉴스를 불러오는 중 오류가 발생했습니다.";
                        } finally {
                            loading.value = false;
                        }
                    };

                    // 페이지 진입 시 한 번 자동으로 호출
                    onMounted(() => {
                        fetchNews();
                    });

                    return {
                        newsList,
                        loading,
                        errorMessage,
                        fetchNews,
                    };
                },
            }).mount("#app");
        </script>
    </body>
    </html>
    ```

    - 상태

        - `newsList` : 서버에서 가져온 GoogleNews 배열

        - `loading` : 로딩 스피너 대신 버튼 텍스트 변경

        - `errorMessage` : 에러 메시지

    - 동작

        - `fetchNews()` : /news/google-news로 요청 → res.json() → newsList에 대입

        - `onMounted(fetchNews)` : 화면 처음 뜰 때 자동 호출

    - 템플릿

        - `v-for`로 뉴스 목록 렌더링

        - `v-if` / `v-else-if` 로 로딩/에러/빈 데이터 처리


---

## 💡 **요약정리**  

- **Fetch API란** 브라우저에 기본 내장된 HTTP 요청 도구입니다.

- **CORS(Cross-Origin Resource Sharing)** 는 **브라우저 보안 정책** 이며, “다른 출처(Origin) 요청”을 기본적으로 막는다. 하지만 서버가 `Access-Control-Allow-Origin` 같은 헤더를 달아주면 브라우저가 허용함. 
    
- 브라우저에서 `CORS` 때문에 호출이 안되면, 서버에서 보내면 된다.

- Vue 코드에서 `ref()`, `onMounted` 템플릿에서 `v-for`, `v-if`, `v-else-if` 만 잘 사용해도 Vue 의 80%는 이해한것.


## 🧩 실습 / 과제

아래 순서대로 차근차근 따라 해보세요.

브라우저 콘솔에서 Fetch 연습

1. 크롬 개발자 도구(DevTools) → Console 탭을 연다.
2. 오늘 만든 `get_board`, `post_board`, `put_board`, `delete_board` 함수를 이용해 본다.

    ```js
    async function get_board(idx) {
        try {
            idx = idx == null ? "" : "/"+idx;
            const res = await fetch("/api/board"+idx);
            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }

    async function post_board(title, content) {
        try {
            const res = await fetch("/api/board/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title:title,
                    content:content
                }),
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }

    async function put_board(idx, title, content) {
        try {
            idx = idx == null ? "" : "/"+idx;
            const res = await fetch("/api/board"+idx, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                }),
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }

    async function delete_board(idx) {
        try {
            idx = idx == null ? "" : "/"+idx;
            const res = await fetch("/api/board"+idx, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const data = await res.json();
            console.log(data);

        } catch (err) {
            console.error("요청 실패:", err);
        }
    }

    ```

    ```js
    await get_board();          // 게시판 목록 조회
    ```
    ```js
    await post_board("제목1", "내용1");   // 게시글 등록
    ```
    ```js
    await get_board(1);         // 1번 글 조회
    ```
    ```js
    await put_board(1, "수정된 제목", "수정된 내용"); // 1번 글 수정
    ```
    ```js
    await delete_board(1);      // 1번 글 삭제
    ```

3. 호출할 때마다 서버 로그 / DB 내용을 같이 확인해 보고, 실제로 INSERT / UPDATE / DELETE가 되었는지 체크해 볼 것.

4. 추가적으로 유저 api 페이지도 호출해 볼것. 

    - 회원가입 ( ... 코드는 직접 작성 )
        ```js
        async function register(id, password, email) { 
            ... 
        }
        ```
        ```js
        await register("idtest", "password", "test@test")
        ```

    - 로그인 ( ... 코드는 직접 작성 )
        ```js
        async function login(id, password) { 
            ...
        }
        ```
        ```js
        await login("id", "password")
        ```

    