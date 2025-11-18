# CDN 방식으로 바로 화면에 Vue 띄우기


## 📘 학습 개요
CDN 방식으로 바로 화면에 Vue 띄우기

## 💡 주요 내용

- 바닐라 JS에서 DOM 조작의 불편함 (querySelector, addEventListener 반복)

- 데이터가 바뀌면 화면을 자동으로 다시 그려주는 반응형(Reactivity) 개념 소개

- Vue는 “HTML + JS 연결을 편하게 해주는 프레임워크” 


## 1. Vue 소개
> Vue(발음: /vjuː/, view와 비슷함)는 사용자 인터페이스를 구축하기 위한 자바스크립트 프레임워크입니다. 표준 HTML, CSS, JavaScript 위에 구축되며, 선언적이고 컴포넌트 기반의 프로그래밍 모델을 제공하여 복잡도에 상관없이 효율적으로 사용자 인터페이스를 개발할 수 있도록 도와줍니다.

## 2. 바닐라 JavaScript vs Vue 비교

1. 바닐라 `Javascript`
    > DOM을 직접 찾아서 직접 수정해야 함.

    `/vue-01/1.html`
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vanilla JS Counter</title>
    </head>
    <body style="text-align: center">
        <h1>카운터 (Vanilla JS)</h1>
        <p id="count">0</p>
        <button id="btn">+1</button>

        <script>
            const countEl = document.getElementById("count");
            const btn = document.getElementById("btn");

            let count = 0;

            btn.addEventListener("click", () => {
                count++;
                countEl.textContent = count; // ← 화면 직접 수정
            });
        </script>
    </body>
    </html>

    ```

    1. DOM 요소를 직접 찾는다

    2. 직접 UI를 업데이트 한다

    3. 코드가 점점 복잡해지고 유지보수 어려움

2. Vue 3 버전 (CDN 방식)
    > "데이터만 바꾸면 화면이 자동 업데이트" 됨.

    `/vue-01/2.html`
    ```html
   <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vue CDN ref 테스트</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    </head>
    <body style="text-align: center">
        <h1>카운터 (Vue)</h1>
        <div id="app">
        <p>{{ count }}</p>
        <button @click="count++">+1</button>
        </div>

        <script>
            const { createApp, ref } = Vue;

            createApp({
                setup() { 

                    const count = ref(0); 
                    
                    return { count }; 

                },
            }).mount("#app");
        </script>
    </body>
    </html>
    ```

    1. DOM을 직접 다룰 필요 없음

    2. count 값만 바꿔도 화면 자동 반영

    3. 코드가 훨씬 짧고 직관적임

## 3. Composition API 구조
> Vue 3에서 공식으로 도입된 새로운 방식의 컴포넌트 작성법.

- Composition API 구조 ( 중요 )
  > Composition API는 한 기능을 구성하는 모든 코드가 `setup()` 내부에 모여 있습니다.
    ```js
    <div id="app">...</div>

    <script>
      const { createApp, ref } = Vue;
      // const createApp = Vue.createApp;
      // const ref = Vue.ref;
      // 한줄로 줄여서 --> const { createApp, ref } = Vue;

      createApp({ // ① Vue 애플리케이션 생성

        setup() {
          // ② 반응형 상태 / 함수 정의
          const count = ref(0);
          const inc = () => count.value++;

          // ③ 템플릿에서 사용할 데이터/함수 반환
          return { count, inc };
        }

      }).mount("#app");        // ④ #app 요소에 앱 장착 (mount)
    </script>
    ```

    ① Vue 앱 만들기
    > createApp()은 새로운 Vue 애플리케이션(루트 컴포넌트)을 생성한다.
    
    ② 상태/함수 정의
        
    - 반응형 상태 (State)

      > ref() → 숫자, 문자열 같은 기본형 데이터를 반응형으로 만든다.

      ```
      const count = ref(0);
      ```
      
    - 함수 (Methods 역할)

      > 이 함수는 Vue 템플릿에서 이벤트(@click 등)로 호출될 수 있다.
      ```
      const inc = () => count.value++;
      ```

    ③ 템플릿에 전달. ( mount 된 곳으로 )
    > setup()에서 return한 값만 템플릿에서 사용할 수 있다.

    ④ mount("#app") → 이 요소의 내부가 Vue가 관리하는 템플릿이 됨
    > mount("#app")은 HTML에서 id="app"인 요소를 Vue의 루트 컨테이너로 지정한다.

    > `<div id="app">...</div>` 이 요소 안의 HTML 내용을 Vue가 “템플릿으로 해석”하여 다시 렌더링한다.

    

- 템플릿이란?
  > Vue가 관리하는 HTML 부분(= 렌더링에 사용하는 HTML 구조)
  ```html
  <div id="app">
    <!-- 템플릿 시작 -->
    <h1>카운터</h1>
    <p>{{ count }}</p> <!-- 템플릿 표현식(Template Expression) -->
    <button @click="inc">증가</button> <!-- 템플릿 디렉티브(Directive) -->
    <!-- 탬플릿 끝 -->
  </div>
  ```
        
    

## 4. Vue 반응성(Reactivity) 를 제대로 이해하기


1. 반응성(Reactivity)이란?

    > 데이터를 변경하면 UI가 자동으로 업데이트되는 기능.

    프레임워크가 “데이터 변화 → 화면 갱신”을 자동으로 해줌.

    우리는 DOM 조작(document.getElementById, innerHTML 등)을 할 필요 없음.

    - 바닐라 JS

        ```
        count++
        document.getElementById('count').textContent = count
        ```

    - Vue
        ```
        count.value++
        ```
        → Vue가 변경을 감지

        → 자동으로 화면 업데이트


2. `ref()` / `reactive()` 는 무엇인가?

    > Vue의 “반응형 상태(reactive state)”를 만드는 함수들

    - Vue에서는 화면이 자동으로 업데이트되게 만들려면 데이터를 “반응형(Reactive)”으로 만들어야 한다.

    - 그때 사용하는 대표 함수가 바로: `ref()`, `reactive()`

    ### 1. `ref()` 는 무엇인가?
    > "반응형 변수"를 만드는 함수

    - 한 개 값(`int`, `string`, `boolean`) 같은 "단일 데이터" 또는 배열( `[ ]` )을 반응형으로 만들 때 사용
    - 값을 꺼낼 때 .value가 필요함

        - 예시) 이 때 count는 그냥 숫자 0 이 아니다.
            ```javascript
            const count = ref(0); // 숫자 0 을 가진 반응형 객체
            ```
        - 이걸 실제 내부 구조로 표현하면 아래와 같음

            ```javascript
            count = { value: 0 } // 숫자 0 을 가진 반응형 객체
            ```

        - Javascript 코드에서 값 변경
            ```js
            count.value++; // Vue가 변경을 감지하고 화면을 자동으로 업데이트
            ```

        - Vue 템플릿 에서 값 변경 ( Vue가 자동으로 .value를 언래핑 ) 
            ```html
            <button @click="count++">+1</button>
            ```
        
        - Vue 템플릿에서 화면에 표시할때는, 
            ```html
            <p>{{ count }}</p>
            ```
            > {{ 변수 }} 는 템플릿 표현식
        

    ### 2. `reactive()` 는 무엇인가?
    > "반응형 객체"를 만드는 함수

    - 여러 속성을 가진 객체나 배열을 반응형으로 만들 때 사용

        - 예시)

            ```js
            const user = reactive({
                name: "Tom",
                age: 20
            })
            ```
        - Javascript 코드에서 값 변경
            ```js
            user.age++
            user.name = "Jane";
            ```

        - Vue 템플릿 에서 값 변경
            ```html
            <button @click="user.age++">+1</button>
            ```

        - Vue 템플릿에서 화면에 표시할때는,
            ```html
            <p>{{ user.name }}</p>
            ```

    ## 요약하면
    1. `ref()` = `반응형 변수`를 만드는 함수

    2. `reactive()` = `반응형 객체`를 만드는 함수 

## 5. Vue 기본 제공 디렉티브 (Vue 3) 실습

⚙️ VSCode 설정 - `ctrl` + `,` 설정에서 `Tab` 검색 후 `Tab size` 2로 변경

- 실습 페이지 ( `/vue-01/ex.html` )

    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vue 디렉티브 실습</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    </head>
    <body style="text-align: center">
        <h1>디렉티브 실습</h1>
        <div id="app">
        <!-- 여기에서 디렉티브 실습 -->

        <!-- 여기에서 디렉티브 실습 -->
        </div>
        <script>
        const { createApp, ref } = Vue;

        const vm = createApp({
            setup() {
            return {};
            },
        }).mount("#app");
        </script>
    </body>
    </html>
    ```

1. 렌더링 관련 디렉티브 - 조건부 렌더링

    - `v-if` / `v-else-if` / `v-else` ( ref )
        > 조건부 렌더링
        ```html
        <p v-if="isLogin">로그인됨</p>
        <p v-else>로그인 안됨</p>
        ```

        ```js
        const isLogin = ref(false);
        ```

    - `v-show` ( ref )
        > 보이기/숨기기 (display 조작)
        ```html
        <p v-show="isVisible">보임</p>
        ```

        ```js
        const isVisible = ref(false);
        ```

    - `v-for` ( ref )
        리스트 반복 렌더링
        ```html
        <li v-for="item in items">{{ item }}</li>
        ```
        ```js
        const items = ref([1, 2, 3, 4, 5, 6, 7]);
        ```

2. 바인딩 관련 디렉티브
    - `v-bind` → : 로 축약 ( ref )
      > HTML 속성에 바인딩

      ```html
      <img :src="url" />
      ```

    - `v-model` ( ref )
      > 양방향 데이터 바인딩
      ```html
      <input v-model="username" />
      ```

    - `v-on` → @ 로 축약 ( methods )
      > 이벤트 바인딩
      ```html
      <button @click="login">로그인</button>
      ```
      ```js
      const login = () => {
        alert("로그인 실행");
      };
      ```

## 6. Vue 반응성(ref, reactive) 완전 이해

`/vue-01/3.html`
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>Vue 반응성(ref, reactive) 완전 이해</title>

    <!-- Vue 3 CDN 불러오기 -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

    <style>
      /* 기본 스타일 */
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 20px;
      }
      .box {
        border: 1px solid #ccc;
        padding: 12px;
        border-radius: 8px;
        background: #f7faff;
        margin: 20px 0;
      }
      h2 {
        margin-top: 40px;
      }
      pre {
        background: #2d2d2d;
        color: #ddd;
        padding: 15px;
        border-radius: 8px;
        overflow-x: auto;
      }
      button {
        padding: 8px 14px;
        font-size: 15px;
        border-radius: 6px;
        cursor: pointer;
        border: none;
        background: #2563eb;
        color: white;
      }
      button:hover {
        background: #1d4ed8;
      }
    </style>
  </head>

  <body>
    <h1>Vue의 반응성(Reactivity) — ref() & reactive()</h1>

    <p>
      Vue는 "데이터가 바뀌면 UI가 자동으로 업데이트"되는
      <b>반응성(Reactivity)</b> 기능을 제공합니다.<br />
      아래의 두 예제를 실행해보면 <b>ref()</b>와 <b>reactive()</b>가 어떤
      방식으로 값을 추적하는지 쉽게 이해할 수 있습니다.
    </p>

    <hr />

    <!-- ----------------------------------------
         1. ref() 예제
         ---------------------------------------- -->
    <h2>1. ref() — 단일 값을 감싸는 반응형 박스</h2>

    <!-- ref() 앱이 적용될 영역 -->
    <div id="refApp" class="box">
      <h3>📦 ref() 시각화</h3>

      <!-- ref가 내부적으로 어떻게 보이는지 설명 -->
      <pre>
count = ref(0)

실제 내부 구조:
count = {
  value: 0   ← 진짜 값은 여기 들어있음!
}
</pre
      >

      <!-- ref는 템플릿 안에서는 .value 없이 자동으로 꺼내서 렌더링됨 -->
      <p>현재 값: <b>{{ count }}</b></p>

      <!-- ref 값 증가 -->
      <button @click="count++">+1 증가</button>
    </div>

    <hr />

    <!-- ----------------------------------------
         2. reactive() 예제
         ---------------------------------------- -->
    <h2>2. reactive() — 객체를 통째로 반응형으로</h2>

    <!-- reactive() 앱이 적용될 영역 -->
    <div id="reactiveApp" class="box">
      <h3>🧰 reactive() 시각화</h3>

      <!-- reactive가 Proxy 객체임을 설명 -->
      <pre>
user = reactive({
  name: "Tom",
  age: 30
})

내부 구조:
Proxy 객체로 감싸져서 속성 변화를 자동 감지!
</pre
      >

      <!-- reactive는 .value 없이 바로 속성 접근 -->
      <p>
        이름: <b>{{ user.name }}</b><br />
        나이: <b>{{ user.age }}</b>
      </p>

      <!-- reactive 객체 속성 변경 -->
      <button @click="user.age++">나이 +1</button>
      <button @click="user.name = 'Jane'">이름 변경 (Tom → Jane)</button>
    </div>

    <hr />

    <!-- 요약 박스 -->
    <h2>3. 정리해보자</h2>

    <div class="box">
      <ul>
        <li><b>ref()</b> → 숫자·문자 같은 '단일 값'을 감싸 반응형으로 만듦</li>
        <li><b>reactive()</b> → 여러 속성을 가진 '객체 전체를' 반응형 처리</li>
        <li>ref는 <code>.value</code> 안에 실제 값이 저장됨</li>
        <li>reactive는 Proxy라서 <code>user.name</code> 처럼 바로 접근</li>
        <li>
          템플릿에서는 ref도 <code>.value</code> 없이 {{ count }}로 접근 가능
        </li>
      </ul>
    </div>

    <!-- ----------------------------------------
         Vue 코드 (refApp, reactiveApp 각각 따로 mount)
         ---------------------------------------- -->
    <script>
      // #1 ref() 예제
      // - ref(0) : "count" 값을 반응형 변수로 만듦
      const { createApp, ref, reactive } = Vue;

      createApp({
        setup() {
          const count = ref(0); // ref는 value 속성 안에 실제 값이 들어감
          return { count }; // 템플릿에서 count 사용 가능
        },
      }).mount("#refApp");

      // #2 reactive() 예제
      // - 객체 전체를 Proxy로 감싸서 속성 변화를 추적함
      createApp({
        setup() {
          const user = reactive({
            name: "Tom",
            age: 30,
          });
          return { user }; // 템플릿에서 user.name 으로 접근 가능
        },
      }).mount("#reactiveApp");
    </script>
  </body>
</html>
```

- ref() 요약

    - 내부적으로는 `{ value: 실제값 }` 구조

    - JS 코드에서는 `count.value`로 접근
    - 템플릿(HTML)에서는 `{{ count }}`, `@click="count++"` 처럼 `.value` 생략 가능

- reactive() 요약

    - JS 코드와 템플릿 모두에서 `user.name`, `user.age` 처럼 그대로 사용


## 6. 이벤트 핸들링
> 이벤트 핸들링 (@click, @input …)

Vue에서는 HTML 이벤트를 @이벤트명 으로 연결한다.
| JavaScript                           | Vue                    |
| ------------------------------------ | ---------------------- |
| `button.addEventListener("click", fn)` | <button `@click="fn"`> |

### 가장 자주 쓰는 이벤트

- `@click` : 버튼 클릭

- `@input` : 입력이 바뀔 때마다 바로 실행 (실시간)

- `@change` : focus를 잃거나 Enter 쳤을 때 실행

- `@keyup` : 키보드를 눌렀다가 뗄 때 실행


### 이벤트 핸들링 예제 ( @input, @change, @keyup )
`/vue-01/4.html`

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

    <style>
      body {
        font-family: Arial;
        padding: 20px;
      }
      .box {
        border: 1px solid #ddd;
        padding: 15px;
        margin: 20px 0;
        border-radius: 8px;
        background: #f8faff;
      }
      input {
        padding: 8px;
        font-size: 16px;
        width: 250px;
      }
    </style>
  </head>

  <body>
    <h1>Vue 이벤트 실습 — @input / @change / @keyup 차이</h1>

    <div id="app">
      <!-- @input -->
      <div class="box">
        <h3>1. @input — 입력할 때마다 즉시 실행</h3>
        <input placeholder="입력해보세요" @input="onInput" />
        <p>이벤트 발생: <b>{{ inputMsg }}</b></p>
      </div>

      <!-- @change -->
      <div class="box">
        <h3>2. @change — 엔터 or 다른 곳 클릭해야 실행</h3>
        <input placeholder="입력한 후 엔터 또는 밖 클릭" @change="onChange" />
        <p>이벤트 발생: <b>{{ changeMsg }}</b></p>
      </div>

      <!-- @keyup -->
      <div class="box">
        <h3>3. @keyup — 키를 눌렀다가 뗄 때 실행</h3>
        <input placeholder="키보드 입력해보세요" @keyup="onKeyup" />        
        <!-- @keyup.enter="fn" 처럼 특정 키(Enter)만 잡아서 처리할 수 있다.-->

        <p>이벤트 발생: <b>{{ keyupMsg }}</b></p>
      </div>
    </div>

    <script>
      const { createApp, ref } = Vue;

      createApp({
        setup() {
          const inputMsg = ref("");
          const changeMsg = ref("");
          const keyupMsg = ref("");

          const onInput = (e) => {
            // 입력이 바뀔 때마다 바로 호출
            inputMsg.value = "입력 중: " + e.target.value;
          };

          const onChange = (e) => {
            // 포커스를 잃거나, 엔터를 눌러 '입력 확정'될 때 호출
            changeMsg.value = "변경됨: " + e.target.value;
          };

          const onKeyup = (e) => {
            // 키를 눌렀다가 뗄 때마다 호출
            keyupMsg.value = "키업: " + e.key + " (값: " + e.target.value + ")";
          };

          return { inputMsg, changeMsg, keyupMsg, onInput, onChange, onKeyup };
        },
      }).mount("#app");
    </script>
  </body>
</html>
```


## 7. v-model
> v-model은 입력창(input, textarea, select)에 들어오는 값을 `ref` 변수와 “자동으로 양방향 연결”해주는 Vue 기능이다.

- 입력 → JS 변수로 자동 반영

- 변수 변경 → 화면에도 자동 반영

### 즉, 양방향 바인딩(Two-way Binding)

1. 가장 기본적인 v-model

    ```html
    <input v-model="msg" placeholder="메시지 입력">
    <p>결과: {{ msg }}</p>
    ```

    ```js
    const msg = ref("")
    return { msg }
    ```

2. `/vue-01/5.html` 실전 예제 — 간단한 로그인 폼
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
    <meta charset="UTF-8">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    </head>
    <body>

    <div id="app" style="text-align:center">
    <h2>로그인</h2>

    <input v-model="id" placeholder="아이디"><br><br>
    <input v-model="pw" type="password" placeholder="비밀번호"><br><br>

    <p>입력값 미리보기:</p>
    <p>ID: {{ id }} / PW: {{ pw }}</p>

    <button @click="login">로그인</button>
    </div>

    <script>
    const { createApp, ref } = Vue;

    createApp({
    setup() {
        const id = ref("");
        const pw = ref("");

        const login = () => {
        alert(`ID: ${id.value}\nPW: ${pw.value}`);
        };

        return { id, pw, login };
    }
    }).mount("#app");
    </script>

    </body>
    </html>

    ```

## 8. 조건부 렌더링 (v-if, v-show)
> 조건부 렌더링은 특정 조건에 따라 HTML 요소를 렌더링하거나 숨기는 기능을 제공합니다.

- `v-if` : 조건이 참일 때만 요소를 렌더링합니다. 조건이 거짓이면 해당 요소는 DOM에서 완전히 제거됩니다.

    ```html
    <div v-if="isVisible">이 요소는 isVisible이 true일 때만 보입니다.</div>
    ```
    > v-if는 조건이 변경될 때마다 해당 요소를 DOM에서 추가하거나 제거합니다. 그래서 DOM 업데이트가 일어날 때 성능에 영향을 줄 수 있습니다.

    > 즉, **드물게** 보였다 안 보였다 할 때 (렌더링 비용이 괜찮을 때)

- `v-show` : 조건이 참일 때 요소를 보여주고, 거짓일 때는 display: none 스타일을 추가하여 숨깁니다.
    ```html
    <div v-show="isVisible">이 요소는 isVisible이 true일 때만 보입니다.</div>
    ```
    > v-show는 요소가 DOM에서 제거되지 않기 때문에 빠르게 토글할 수 있습니다. 하지만 처음에 페이지가 렌더링될 때 요소가 항상 로드되어 있기 때문에 v-if보다 초기 렌더링 성능이 더 느릴 수 있습니다.

    > 즉, **자주 토글**되는 요소에 사용 (탭, 토글 스위치 등)


## 9. 리스트 렌더링 (v-for)
> v-for는 배열이나 객체를 반복하여 HTML 요소를 렌더링할 때 사용합니다. Vue는 v-for 디렉티브를 통해 데이터를 반복하여 동적으로 UI를 업데이트할 수 있습니다.

1. 기본 문법

    ```html
    <li v-for="item in items">
    {{ item }}
    </li>
    ```
    - items : setup()에서 만든 배열 (예: ['사과', '바나나'])
    - item : 반복하면서 배열 안에 들어있는 요소 하나씩

    - JS 코드로 풀어 쓰면 이런 느낌:
        ```js
        items.forEach((item) => {
        // <li>{{ item }}</li> 를 하나씩 만들어서 화면에 추가
        });
        ```

2. `/vue-01/6.html` — 기본 v-for 예제

    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <title>Vue 리스트 렌더링 (v-for)</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        h1 {
            margin-bottom: 10px;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin: 4px 0;
        }
        .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 16px 0;
            background: #f8faff;
        }
        input {
            padding: 6px 10px;
            font-size: 14px;
        }
        button {
            padding: 6px 10px;
            font-size: 14px;
            margin-left: 4px;
            cursor: pointer;
        }
        </style>
    </head>

    <body>
        <h1>v-for로 목록 렌더링하기</h1>

        <div id="app">
        <!-- 1) 기본 리스트 렌더링 -->
        <div class="box">
            <h3>1. 과일 리스트 (기본 v-for)</h3>
            <ul>
            <!-- fruits 배열을 순회하면서 fruit 를 하나씩 꺼냄 -->
            <li v-for="fruit in fruits" :key="fruit">
                {{ fruit }}
            </li>
            </ul>
        </div>

        <!-- 2) (item, index) 같이 사용 -->
        <div class="box">
            <h3>2. (item, index) 함께 사용</h3>
            <ul>
            <!-- (todo, index) 형식으로 인덱스도 함께 사용 가능 -->
            <li v-for="(todo, index) in todos" :key="index">
                {{ index }}번: {{ todo }}
            </li>
            </ul>
        </div>

        <!-- 3) 객체 배열 + key 사용 -->
        <div class="box">
            <h3>3. 객체 배열 + key (권장)</h3>
            <p>학생 목록:</p>
            <ul>
            <!-- students 배열의 각 요소는 { id, name } 형태의 객체 -->
            <!-- :key는 Vue가 각 요소를 구분할 수 있게 해주는 유니크 값 -->
            <li v-for="s in students" :key="s.id">
                {{ s.id }}번 - {{ s.name }}
            </li>
            </ul>
        </div>

        <!-- 4) 입력으로 리스트에 항목 추가 -->
        <div class="box">
            <h3>4. 입력값을 v-for 리스트에 추가해보기</h3>
            <input
            v-model="newTodo"
            placeholder="할 일을 입력하고 추가 버튼을 눌러보세요"
            />
            <button @click="addTodo">추가</button>

            <ul>
            <!-- 실제 서비스에서는 i보다는 todo.id처럼 '고유값'을 쓰는 게 더 좋음 -->
            <li v-for="(todo, i) in todos" :key="i">
                {{ i + 1 }}. {{ todo }}
            </li>
            </ul>
        </div>
        </div>

        <script>
        const { createApp, ref } = Vue;

        createApp({
            setup() {
            // 1) 문자열 배열
            const fruits = ref(["사과", "바나나", "포도"]);

            // 2) 할 일 목록
            const todos = ref(["Vue 공부하기", "JSP 복습하기"]);

            // 3) 객체 배열 (id, name)
            const students = ref([
                { id: 1, name: "홍길동" },
                { id: 2, name: "김철수" },
                { id: 3, name: "이영희" },
            ]);

            // 4) 입력값을 받아서 todos에 추가
            const newTodo = ref("");

            const addTodo = () => {
                if (newTodo.value.trim() === "") return;
                todos.value.push(newTodo.value.trim());
                newTodo.value = "";
            };

            return {
                fruits,
                todos,
                students,
                newTodo,
                addTodo,
            };
            },
        }).mount("#app");
        </script>
    </body>
    </html>
    ```

3. v-for에서 key가 왜 중요할까?
    ```html
    <li v-for="s in students" :key="s.id">
        {{ s.id }} - {{ s.name }}
    </li>
    ```
    - `:key` 를 안 쓰면

        - Vue가 “어떤 항목이 어떤 DOM인지” 정확히 구분하기 힘들다

        - 항목을 중간에 추가/삭제할 때 렌더링이 꼬이거나 성능이 떨어질 수 있음

    - `:key`="고유값" (예: DB의 PK, id 등)을 넣어주면

        - Vue가 리스트를 효율적으로 비교/업데이트할 수 있음

        - 리스트 렌더링할 땐 항상 key 쓰는 습관 들이기!



## 💡 **요약정리**  

> Vue는 DOM을 직접 조작하지 않고 데이터만 바꾸면 화면이 자동으로 업데이트되는 프레임워크이다.

> ref()(단일 값)와 reactive()(객체/배열)로 반응형 상태를 만들고, v-model, v-if, v-for, @click 같은 디렉티브로 HTML과 JS를 자연스럽게 연결한다.


## 🧩 실습 / 과제

- `6.html` 에서 [추가] 버튼을 눌렀을때, `1. 과일 리스트 (기본 v-for)` 와 `3. 객체 배열 + key (권장)` 에도 입력한 내용 추가되도록 수정하기. 

    - `addTodo()` 함수를 수정하면됨.


## 추가내용

```js

// 로컬 스토리지 값 가져오기
const sess_user_id = localStorage.getItem("sess_user_id");

// 로컬 스토리지 값 넣기
localStorage.setItem("sess_user_id", sess_user_id);



const board_list = ref([]);
const res = {data:[]};

// filter 로 중복 내용 제거하기
const uniqueItems = res.data.filter((newItem) => {
  return !board_list.value.some(
    (oldItem) => oldItem.idx === newItem.idx
  );
});

// 배열에 배열 push
board_list.value.push(...uniqueItems);

// 배열 합치기
board_list.value = [...uniqueItems, ...board_list.value];

// 배열 안 요소 삭제
board_list.value = board_list.value.filter((b) => b.idx !== idx);

// 경고창 띄우기 : 예 하면 밑으로 진행
if (!confirm("삭제하시겠습니까?")) return false;

const vm = createApp({
  ...
  setup() {
    ...
    // mount 될때 한번 실행 setup() 안에 넣으면됨
    onMounted(() => {
      
    });
    ...
  }
  ...
}
```