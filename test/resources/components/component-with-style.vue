<template>
    <div class="color-red">
        <p>
            <span />
        </p>
    </div>
</template>

<style>
    .color-red {
        color: red;
    }

    .color-red > p {
        color: red;
    }

    p span {
        color: red;
    }

    div > span {
        color: orange
    }
</style>

<script>
    export default{
        name: 'component-with-style',
    };
</script>
