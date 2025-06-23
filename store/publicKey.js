import { defineStore } from 'pinia'
import { ref } from 'vue'
import JSEncrypt from 'jsencrypt'
import { useRequest, COMMON_API_PATH } from '../fetch'

// 写死的 RSA 公钥
const STATIC_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6bx3Hhiy1JsWakIlO4iQXJB7E
D6gwMRikLI1NEYGPZHQ/R8y95/N2zQfqt3RE9hyeuBGajWHS31vOrH8/spSNMLRL
sw2YCJgUlglESFQUGe2jLqCxDnAfSuFgAPpA3pUgDLF1kySoZ5n08nTtgGFkXUevw
eOUidIfUNaQswSqCwIDAQAB
-----END PUBLIC KEY-----`

export const usePublicKeyStore = defineStore('publicKey', () => {
    const keyCache = ref('')
    const { response, onRefresh } = useRequest({
        url: COMMON_API_PATH.PUBLIC_KEY,
        initialValues: '',
        manual: true
    })

    const onEncode = async (content, useStatic = false) => {
        let keyToUse = ''

        if (useStatic) {
            keyToUse = STATIC_PUBLIC_KEY
        } else {
            if (!keyCache.value) {
                await onRefresh()
                keyCache.value = response.value
            }
            keyToUse = keyCache.value
        }

        const encrypt = new JSEncrypt()
        encrypt.setPublicKey(keyToUse)
        return encrypt.encrypt(content)
    }

    return {
        onEncode,
        onUpdatePublicKey: onRefresh,
    }
})