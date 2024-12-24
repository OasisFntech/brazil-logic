import axios from 'axios'

const instance = axios.create({
    baseURL: '/api'
})

function axiosDefaultConfig(config) {
    Object.entries(config).forEach(e => {
        const [ key, val ] = e

        instance.defaults[key] = val
    })
}

function onFetchErr(err) {
    console.error(err)
    return Promise.reject(err)
}

function axiosInterceptors({ request, requestError, response, responseError }) {
    instance.interceptors.request.use(request, requestError ?? onFetchErr)
    instance.interceptors.response.use(response, responseError ?? onFetchErr)
}

export default instance

export {
    axiosInterceptors,
    axiosDefaultConfig,
    onFetchErr
}
