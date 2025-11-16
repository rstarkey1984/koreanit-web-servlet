// service.js
// ------------------------------------
// API 레이어(api.js)를 감싸는 서비스 레이어
// - ServiceResult { success, message, data } 해석
// - 로그인 상태 localStorage 저장/복원
// - 게시판 도메인 로직
// ------------------------------------

// 공통: ServiceResult 언래핑
function unwrapServiceResult(raw, defaultMessage) {
    if (!raw) {
        throw new Error(defaultMessage || "응답이 없습니다.");
    }

    // success 필드가 명시적으로 false 이면 실패로 간주
    if (raw.success === false) {
        throw new Error(raw.message || defaultMessage || "요청 실패");
    }

    // success가 true이거나 없으면 data 반환
    return raw.data;
}

// ---------- AuthService ----------
const AuthService = {
    /**
     * 로그인
     * @param {string} id
     * @param {string} password
     * @returns {Promise<{id:string}>}
     */
    async login(id, password) {
        const raw = await apiLoginUser({ id, password });
        const data = unwrapServiceResult(raw, "로그인 실패");

        // 서버에서 유저정보를 내려준다면 data 사용, 아니면 입력값으로 구성
        const user = {
            id: data?.id || id,
            // 필요시 data.name, data.role 등 추가
        };

        // 로그인 상태 저장 (옵션)
        localStorage.setItem("loginUser", JSON.stringify(user));

        return user;
    },

    /**
     * 회원가입
     * @param {{id:string, password:string, email:string}} payload
     */
    async register(payload) {
        const raw = await apiRegisterUser(payload);
        unwrapServiceResult(raw, "회원가입 실패");
        // 특별히 반환값 필요 없으면 여기서 끝
    },

    /**
     * 로그아웃
     */
    async logout() {
        try {
            const raw = await apiLogoutUser();
            unwrapServiceResult(raw, "로그아웃 실패");
        } catch (e) {
            console.warn("로그아웃 요청 중 오류(무시 가능):", e);
        } finally {
            localStorage.removeItem("loginUser");
        }
    },

    /**
     * 새로고침 후 로그인 복원
     */
    restoreLogin() {
        const saved = localStorage.getItem("loginUser");
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.warn("저장된 로그인 정보 파싱 실패:", e);
            return null;
        }
    },
};

// ---------- BoardService ----------
const BoardService = {
    /**
     * 게시글 목록 조회
     * @param {number} page
     * @param {number} size
     * @returns {Promise<{list: any[], totalCount: number}>}
     */
    async list(page = 1, size = 10) {
        const raw = await apiFetchBoardList(page, size);
        // raw = { success, message, data: [...] }
        const data = unwrapServiceResult(raw, "게시글 목록 조회 실패");

        let list = [];
        let totalCount = 0;

        if (Array.isArray(data)) {
            list = data;
            totalCount = data.length;
        } else if (data && Array.isArray(data.list)) {
            list = data.list;
            totalCount = typeof data.totalCount === "number" ? data.totalCount : list.length;
        }

        return { list, totalCount };
    },

    /**
     * 게시글 상세 조회
     */
    async get(id) {
        const raw = await apiFetchBoard(id);
        return unwrapServiceResult(raw, "게시글 조회 실패");
    },

    /**
     * 게시글 작성
     */
    async create({ title, content }) {
        const raw = await apiCreateBoard({ title, content });
        return unwrapServiceResult(raw, "게시글 작성 실패");
    },

    /**
     * 게시글 수정
     */
    async update(id, { title, content }) {
        const raw = await apiUpdateBoard(id, { title, content });
        return unwrapServiceResult(raw, "게시글 수정 실패");
    },

    /**
     * 게시글 삭제
     */
    async remove(id) {
        const raw = await apiDeleteBoard(id);
        return unwrapServiceResult(raw, "게시글 삭제 실패");
    },
};

// 전역으로 노출 (app.js에서 사용)
window.AuthService = AuthService;
window.BoardService = BoardService;
