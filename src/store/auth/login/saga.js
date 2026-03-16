import { takeEvery, fork, put, all, call } from 'redux-saga/effects';

// Login Redux States
import { CHECK_LOGIN, LOGOUT_USER } from './actionTypes';
import { apiError, loginUserSuccessful, logoutUserSuccess } from './actions';

// AUTH related methods
import { getFirebaseBackend } from '../../../helpers/firebase_helper';

//Initilize firebase
const fireBaseBackend = getFirebaseBackend();

function* loginUser({ payload: { user, history } }) {
    try {
        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            const response = yield call(fireBaseBackend.loginUser, user.username, user.password);
            yield put(loginUserSuccessful(response));
            history('/dashboard');
        } else {
            const response = yield call(fetch, `${process.env.REACT_APP_API_URL}/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.username, password: user.password }),
            });

            if (!response.ok) {
                const errorData = yield call([response, response.json]);
                throw new Error(errorData.message || "Invalid credentials");
            }

            const data = yield call([response, response.json]);
            const JsonResponse = JSON.stringify(data.data);
            localStorage.setItem("user", JsonResponse);

            yield put(loginUserSuccessful(data.data));
            history('/dashboard');
        }
    } catch (error) {
        yield put(apiError(error.message ? error.message : error));
    }
}

function* logoutUser({ payload: { history } }) {
    try {
        localStorage.removeItem("authUser");

        if (process.env.REACT_APP_DEFAULTAUTH === 'firebase') {
            const response = yield call(fireBaseBackend.logout);
            yield put(logoutUserSuccess(response));
        }

        history('/');
    } catch (error) {
        yield put(apiError(error));
    }
}

export function* watchUserLogin() {
    yield takeEvery(CHECK_LOGIN, loginUser);
}

export function* watchUserLogout() {
    yield takeEvery(LOGOUT_USER, logoutUser);
}

function* loginSaga() {
    yield all([
        fork(watchUserLogin),
        fork(watchUserLogout),
    ]);
}

export default loginSaga;