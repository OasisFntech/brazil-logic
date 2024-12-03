import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useRequest, COMMON_API_PATH, NOTICE_SOCKET } from '../fetch'
import { useMessageStore, useUserInfoStore } from './user'
import { utils_assign_object } from '../utils'

export const useSiteConfigStore = defineStore('siteConfig', () => {
    // 站点配置
    const siteConfig = ref({
        keyword: null,
        siteLogo: null,
        siteLogo2: null,
        // 站点名
        siteName: '',
        // 页面 ico 图标
        titleAddress: '',
        // 备案号 - Copyright展示
        recordNumber: '',
        siteSwitch: false,
        registerSwitch: false,
        type: '',
        benchmarkPeople: 0,
        benchmarkAmount: 0,
        applyContractSwitch: false,
        // 商标地址 - Copyright展示
        copyrightInformation: '',
        imgCodeSwitch: false,
        // 客服链接 - Footer展示
        customerServiceLink: '',
        // 客服联系方式 - Footer展示
        customerServicePhone: '',
        customerServiceUrl: '',
        longConnectionSwitch: '',
        // 办公地址 - Footer展示
        officeLocation: '',
        // 办公时间 - Footer展示
        onlineTime: '',
        siteStat: '',
        webSiteStat: '',
        rebateSwitch: false,
        autoAgent: false,
        // 底部二维码地址 - Footer展示
        qrCodeAddress: '',
        withdrawUseFree: false,
        followBuyUseFree: false,
        needCheckOldPwd: false,
        bindCardCheckTxPwd: false,
        registerSMS: 1,
        isCloseSMS: 1,
        changeSMS: 1,
        showCapitalRecord: 1,
        showRechargeRecord: 1,
        withdrawPriority: 1,
    })

    const { onRefresh: onRefreshSiteConfig } = useRequest({
        url: COMMON_API_PATH.SITE_CONFIG,
        onSuccess: res => {
            siteConfig.value = utils_assign_object(siteConfig.value, res, true)
            run({
                configKey: 'customerServiceManagement'
            })
        }
    })

    // 请求客服配置 ps:后端可优化的接口
    const { onRefresh: onRefreshService, run } = useRequest({
        url: COMMON_API_PATH.SITE_CONFIG_BASE,
        // params: {
        //     configKey: 'customerServiceManagement'
        // },
        manual: true,
        onSuccess: res => {
            siteConfig.value = utils_assign_object(siteConfig.value, res, true)
        }
    })

    // 获取logo
    const { response: logoRes } = useRequest({
        url: COMMON_API_PATH.PC_CONFIG,
        initialValues: {
            logoAddress: '',
            exchange: '',
            company: '',
            timeZone: '',
        }
    })

    return {
        siteConfig,
        logoRes,
        onRefreshService,
        onRefreshSiteConfig
    }
})

export const useNoticeStore = defineStore('notice', () => {
    const userInfoStore = useUserInfoStore(),
        { onRefreshUserInfo } = userInfoStore,
        { userInfo } = storeToRefs(userInfoStore),
        { onRefreshReadStatus } = useMessageStore()

    if (userInfo.value.token && !NOTICE_SOCKET.active) {
        NOTICE_SOCKET.emit(undefined,
            {
                memberId: userInfo.value.memberId,
                token: userInfo.value.token,
            }
        )
    }

    const notice = ref([])

    NOTICE_SOCKET.on(res => {
        notice.value = [
            ...notice.value.slice(-4),
            res[0]
        ]
        onRefreshReadStatus()

        if (res[0].type === 'Stand_Inside_Letter') {
            onRefreshUserInfo()
        }
    })

    return {
        notice,
    }
})
