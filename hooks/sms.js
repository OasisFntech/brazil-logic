import { computed, ref } from 'vue'

import { api_fetch, COMMON_API_PATH } from '../fetch'
import { useCountdown } from './countdown'
import { useMobileLogin } from './login'

export const useSms = (name, { successTip, errorTip, tipText }) => {
    const { countdown, onCountdown } = useCountdown(name)
    const { updateCode, formState } = useMobileLogin()

    const loading = ref(false)
    const smsCode = ref(null)

    const smsBtn = computed(() => {
        const isCounting = countdown.value === 0

        return {
            text: isCounting ? '发送验证码' : `${countdown.value}s`,
            disabled: !isCounting,
            loading: loading.value,
            smsCode: smsCode.value
        }
    })


    // 发送短信验证码
    const onSendSms = async (phone,area) => {
        if (!loading.value) {
            loading.value = true
            try {
                const { code, message } = await api_fetch({
                    url: `${COMMON_API_PATH.SMS_SEND}${area}/${phone}`,
                    options: {
                        returnAll: true,
                    }
                })
                successTip?.(tipText)
                onCountdown()
                if(code===1 && message){
                    updateCode(message)
                    smsCode.value = message
                }
            } catch (err) {
                errorTip?.(err.message)
            } finally {
                loading.value = false
            }
        }
    }

    return {
        smsBtn,
        onSendSms,
    }
}
