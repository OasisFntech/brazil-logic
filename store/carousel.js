import { ref } from 'vue'
import { defineStore } from 'pinia'
import { COMMON_API_PATH, FETCH_METHOD, api_fetch } from '../fetch'

export const useCarouselStore = defineStore('carousel', () => {
    const carousel = ref([]),
        loading = ref(false)

    const onGetCarousel = async(device) => {
        if (!carousel.value.length && !loading.value) {
            loading.value = true

            try {
                carousel.value = await api_fetch({
                    url: `${COMMON_API_PATH.CAROUSEL}/${device}`,
                    method: FETCH_METHOD.GET
                })
            } finally {
                loading.value = false
            }
        }
    }

    return {
        loading,
        carousel,
        onGetCarousel
    }
})
