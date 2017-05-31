<template>
    <div>
        <div v-if="!ready" class="not-ready">not-ready</div>
        <div v-else class="ready">ready</div>

        <div v-if="ready" class="parent">
            <div class="child ready"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'If',
        data: () => ({
            ready: false,
        }),
    };
</script>
