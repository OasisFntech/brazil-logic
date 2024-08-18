import { inflate } from 'pako'
import { useClipboard } from '@vueuse/core'
import _ from 'lodash'
import currency from 'currency.js'

export * from './charts'
export * from './stock'

/**
 * @function utils_base64
 * @param base64String {string} base64加密字符串
 * @return object
 * @description 解析接口返回的base64加密字符串
 * */
export const utils_base64 = base64String => {
    try {
        return JSON.parse(
            inflate(
                new Uint8Array(
                    atob(base64String)
                        .split('')
                        .map(e => e.charCodeAt(0))
                ),
                { to: 'string' }
            )
        )
    } catch (e) {
        console.error(e)
        return base64String
    }
}

/**
 * @function utils_link
 * @param url {string} 跳转地址 | HTMLHyperlinkElementUtils.href
 * @param target 跳转方式 | HTMLAnchorElement.target
 * @description 用 a 标签模拟跳转，避免兼容性问题
 * */
export const utils_link = (url, target = '_blank') => {
    const link = document.createElement('a')

    link.href = url
    link.target = target

    const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    })
    link.dispatchEvent(event)
}

/**
 * @function utils_amount_chinesization
 * @param amount {number} 金额
 * @param options {object}
 * @params showThousand 是否展示 千 位
 * @params fixed 保留小数位数
 * @return string
 * @description 将金额处理为带汉字的缩略
 * */
export const utils_amount_chinesization = (amount, options) => {
    const { showThousand, fixed } = {
        showThousand: true,
        fixed: 2,
        ...options
    }

    let base = 0,
        remainder = 0

    if (isNaN(amount)) return '--'

    if (amount < 1000) return amount.toFixed(fixed)

    if (amount < 10000) return showThousand ? `${(amount / 1000).toFixed(fixed)}千` : amount.toFixed(fixed)

    if (amount < 100000000) {
        base = Math.floor(amount / 10000)
        remainder = (amount % 10000) / 10000
        return (base + remainder).toFixed(fixed) + '万'
    }

    if (amount < 1000000000000) {
        base = Math.floor(amount / 100000000)
        remainder = (amount % 100000000) / 100000000
        return (base + remainder).toFixed(fixed) + '亿'
    }

    base = Math.floor(amount / 100000000000)
    remainder = (amount % 100000000000) / 100000000000
    return (base + remainder).toFixed(fixed) + '千亿'
}

export const utils_amount_bx = (amount, options) => {
    const { showThousand, fixed } = {
        showThousand: true,
        fixed: 2,
        ...options
    }

    let base = 0,
        remainder = 0

    if (isNaN(amount)) return '--'

    return amount.toFixed(fixed)
}

export const utils_number_format = (number, options) => {
    if (isNaN(number)) {
        return number
    } else {
        const { prefix, fixed, suffix } = {
            fixed: 2,
            prefix: '',
            suffix: '',
            ...options,
        }

        return `${prefix}${Number(number).toFixed(fixed)}${suffix}`
    }
}

export const utils_inviteCode = () => {
    const { href } = window.location,
        params = new URLSearchParams(href.split('?')[1])

    return params.get('inviteCode')
}

export const utils_guideRedirect = (url, target) => {
    const params = new URLSearchParams(),
        inviteCode = utils_inviteCode()

    if (inviteCode) {
        params.set('inviteCode', inviteCode)
        url += `?${params.toString()}`
    }

    utils_link(url, target)
}

export const utils_decisionDevice = () => {
    const isPhone = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i),
        pathname = window.location.pathname

    if (isPhone) {
        if (!pathname.includes('/m/')) {
            utils_guideRedirect('/m/', '_self')
        }
    } else {
        if (!pathname.includes('/pc/')) {
            utils_guideRedirect('/pc/', '_self')
        }
    }
}

export const utils_favicon = (href) => {
    const faviconLink = document.createElement('link')
    faviconLink.rel = 'icon'
    faviconLink.href = href
    faviconLink.type = 'image/x-icon'

    document.head.appendChild(faviconLink)
}

export const utils_assign_object = (oldObj, newObj, force) => {
    const obj = {
        ...oldObj
    }

    _.entries(newObj).forEach(e => {
        const [ key, val ] = e

        if (force) {
            obj[key] = val
        } else if (val !== undefined) {
            obj[key] = val
        }
    })

    return obj
}

// 复制函数
export const utils_copy = async (content) => {
    // 用户浏览器授权
    const { copy } = useClipboard({ legacy: true })

    await copy(content)
}

// 清楚所有缓存
export const utils_storage_clear = () => {
    sessionStorage.clear()
    localStorage.clear()
}

export const utils_hide_info = (content, type) => {
    switch (type) {
        case 'mobile':
            return `${content.slice(0, 3)}****${content.slice(-4)}`
        default:
            return '****'
    }
}

export const utils_referrer = () => {
    const { href, origin, pathname } = window.location,
        params = new URLSearchParams(href.replace(`${origin}${pathname}#/`, '')),
        inviteCode = params.get('inviteCode')

    if (inviteCode) sessionStorage.setItem('inviteCode', inviteCode)
}

/**
 * @function utils_colorful
 * @description 根据数值大小返回颜色类名
 * @param value 需要判断的数值
 * @param defaultColor 默认类名
 * @return String
 * */
export const utils_colorful = (value, defaultColor = 'text-gray-400') => {
    let color = defaultColor
    if (value > 0) color = 'text-raise'
    if (value < 0) color = 'text-fall'

    return color
}

// 巴西转时间格式
export const formatDateTime_bx = (dateTime, options = {}) => {
    const { dateFormat = 'MM-DD-YYYY', timeFormat = 'HH:mm:ss' } = {
        dateFormat: 'MM-DD-YYYY',
        timeFormat: 'HH:mm:ss',
        ...options
    }
    const [date, time] = dateTime.split(' ')
    const [year, month, day] = date.split('-')

    const formatDate = (format) => {
        switch (format) {
            case 'MM-DD-YYYY':
                return `${month}-${day}-${year}`
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`
            default:
                return `${month}-${day}-${year}`
        }
    };

    const formattedDate = formatDate(dateFormat)
    return `${formattedDate} ${time ?? ''}`
}

// 根据不同国家的货币格式化金额
export const utils_currency_convert = (amount, options = {}) => {
    const { countryCode = 'BR', fixed = 2, showSymbol = false } = options

    let symbol = ''
    let formatOptions = {
        precision: fixed
    }

    if (showSymbol) {
        switch (countryCode) {
            case 'BR': // 巴西
                symbol = 'R$'
                break
            case 'US': // 美国
                symbol = '$'
                break
            case 'ID': // 印尼
                symbol = 'Rp'
                break
            case 'NG': // 尼日利亚
                symbol = '₦'
                break
            default:
                symbol = '$'
                break
        }
    }

    return currency(amount, { ...formatOptions, symbol }).format()
}

