import { ref, reactive } from 'vue'

import { COMMON_FORM_CONFIG } from '../config'
import { api_fetch, COMMON_API_PATH, FETCH_METHOD, NOTICE_SOCKET } from '../fetch'
import { usePublicKeyStore, useUserInfoStore, useMessageStore } from '../store'
import { useFormDisabled } from './index'

export const useAccountLogin = (useStatic = false) => {
    const { onEncode } = usePublicKeyStore(),
        { onSetUserInfo, onRefreshUserInfo } = useUserInfoStore(),
        { onRefreshReadStatus } = useMessageStore()

    const formState = reactive({
            account: '',
            password: '',
            region: ''
        }),
        disabled = useFormDisabled(formState),
        loading = ref(false)

    const onAccountLogin = async() => {
        if (!loading.value) {
            loading.value = true
            try {
                const res = await api_fetch({
                    url: COMMON_API_PATH.LOGIN_BY_ACCOUNT,
                    params: {
                        username: formState.account,
                        password: await onEncode(formState.password, useStatic),
                        region: formState.region,
                    }
                })

                sessionStorage.clear()

                onSetUserInfo(res)
                onRefreshUserInfo()
                onRefreshReadStatus()
                NOTICE_SOCKET.emit(undefined, {
                    memberId: res.memberId,
                    token: res.token,
                })
            } finally {
                loading.value = false
            }
        }
    }

    return {
        formState,
        formConfig: [
            COMMON_FORM_CONFIG.account,
            COMMON_FORM_CONFIG.password
        ],
        disabled,
        loading,
        onAccountLogin
    }
}

export const useMobileLogin = (bizType, callback) => {
    const { onSetUserInfo, onRefreshUserInfo } = useUserInfoStore(),
        { onRefreshReadStatus } = useMessageStore()

    const emitList = ['transactionPassword']

    const formState = reactive({
            mobile: '',
            code: '',
            transactionPassword: ''
        }),
        disabled = useFormDisabled(formState, emitList),
        loading = ref(false)

    const formConfig = [
        COMMON_FORM_CONFIG.mobile,
        COMMON_FORM_CONFIG.code
    ]

    const updateCode = (code) =>{
        formState.code = code
    }

    const onMobileLogin = async() => {
        if (!loading.value) {
            loading.value = true
            try {
                const isRegister = await api_fetch({
                    url: COMMON_API_PATH.CHECK_MOBILE_V2_REGISTER,
                    method: FETCH_METHOD.GET,
                    params: {
                        phone: formState.mobile,
                        code: formState.code,
                        bizType: bizType
                    }
                })

                if (isRegister) {
                    if (bizType === 'register') {
                        callback?.(isRegister)
                        return Promise.reject()
                    } else {
                        const res = await api_fetch({
                            url: COMMON_API_PATH.LOGIN_BY_MOBILE,
                            params: {
                                phone: formState.mobile,
                                code: formState.code,
                                transactionPassword: formState.transactionPassword
                            }
                        })

                        sessionStorage.clear()

                        onSetUserInfo(res)
                        onRefreshUserInfo()
                        onRefreshReadStatus()
                        NOTICE_SOCKET.emit(undefined, {
                            memberId: res.memberId,
                            token: res.token,
                        })
                    }
                } else {
                    callback?.(isRegister)
                    return Promise.reject()
                }
            } finally {
                loading.value = false
            }
        }
    }

    return {
        formState,
        formConfig,
        disabled,
        loading,
        onMobileLogin,
        updateCode
    }
}

export const useEmailLogin = (callback) => {
    const { onSetUserInfo, onRefreshUserInfo } = useUserInfoStore(),
        { onRefreshReadStatus } = useMessageStore()

    const formState = reactive({
            email: '',
            code: ''
        }),
        disabled = useFormDisabled(formState),
        loading = ref(false)

    const formConfig = [
        COMMON_FORM_CONFIG.mobile,
        COMMON_FORM_CONFIG.code
    ]

    const updateCode = (code) =>{
        formState.code = code
    }

    const onEmailLogin = async() => {
        if (!loading.value) {
            loading.value = true
            try {
                const isRegister = await api_fetch({
                    url: COMMON_API_PATH.CHECK_EMAIL_V2_REGISTER,
                    method: FETCH_METHOD.GET,
                    params: {
                        email: formState.email,
                        code: formState.code,
                        bizType: 'login'
                    }
                })

                if (isRegister) {
                    const res = await api_fetch({
                        url: COMMON_API_PATH.LOGIN_BY_MOBILE,
                        params: {
                            email: formState.email,
                            code: formState.code,
                            registerType: 'EMAIL'
                        }
                    })

                    sessionStorage.clear()

                    onSetUserInfo(res)
                    onRefreshUserInfo()
                    onRefreshReadStatus()
                    NOTICE_SOCKET.emit(undefined, {
                        memberId: res.memberId,
                        token: res.token,
                    })
                } else {
                    callback?.()
                    return Promise.reject()
                }
            } finally {
                loading.value = false
            }
        }
    }

    return {
        formState,
        disabled,
        loading,
        onEmailLogin,
        updateCode
    }
}
