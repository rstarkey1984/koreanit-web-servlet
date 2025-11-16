// /assets/js/auth-app.js
// 로그인 / 회원가입만 담당하는 Vue 앱 (service.js 기반)

const { createApp, ref, onMounted } = Vue;

createApp({
    setup() {
        // ---------- 로그인 폼 상태 ----------
        const loginId = ref("");
        const loginPw = ref("");
        const loginLoading = ref(false);
        const loginError = ref("");
        const loginMessage = ref("");

        // 간단한 로그인된 사용자 표시
        const loggedInUser = ref(null);

        // ---------- 회원가입 폼 상태 ----------
        const registerId = ref("");
        const registerPw = ref("");
        const registerEmail = ref("");
        const registerLoading = ref(false);
        const registerError = ref("");
        const registerMessage = ref("");

        // ---------- 로그인 ----------
        const login = async () => {
            if (!loginId.value || !loginPw.value) {
                loginError.value = "ID와 비밀번호를 입력하세요.";
                loginMessage.value = "";
                return;
            }

            loginLoading.value = true;
            loginError.value = "";
            loginMessage.value = "";

            try {
                // 🔸 service.js 의 AuthService 사용
                const user = await AuthService.login(loginId.value, loginPw.value);

                // 로그인 성공 처리
                loggedInUser.value = user.id || loginId.value;
                loginMessage.value = "로그인 성공!";
            } catch (e) {
                console.error(e);
                loginError.value = e.message || "로그인 실패";
            } finally {
                loginLoading.value = false;
            }
        };

        // ---------- 회원가입 ----------
        const register = async () => {
            if (!registerId.value || !registerPw.value || !registerEmail.value) {
                registerError.value = "ID, 비밀번호, 이메일을 모두 입력하세요.";
                registerMessage.value = "";
                return;
            }

            registerLoading.value = true;
            registerError.value = "";
            registerMessage.value = "";

            try {
                // 🔸 service.js 의 AuthService 사용
                await AuthService.register({
                    id: registerId.value,
                    password: registerPw.value,
                    email: registerEmail.value,
                });

                registerMessage.value = "회원가입 완료! 이제 로그인 해 주세요.";

                // 입력값 초기화 (선택)
                registerId.value = "";
                registerPw.value = "";
                registerEmail.value = "";
            } catch (e) {
                console.error(e);
                registerError.value = e.message || "회원가입 실패";
            } finally {
                registerLoading.value = false;
            }
        };

        // ---------- 초기 로딩: 기존 로그인 상태 복원 ----------
        onMounted(() => {
            if (typeof AuthService.restoreLogin === "function") {
                const saved = AuthService.restoreLogin();
                if (saved && saved.id) {
                    loggedInUser.value = saved.id;
                    loginMessage.value = "이전 로그인 상태를 복원했습니다.";
                }
            }
        });

        return {
            // 로그인 바인딩
            loginId,
            loginPw,
            loginLoading,
            loginError,
            loginMessage,
            loggedInUser,
            login,

            // 회원가입 바인딩
            registerId,
            registerPw,
            registerEmail,
            registerLoading,
            registerError,
            registerMessage,
            register,
        };
    },
}).mount("#auth-app");
