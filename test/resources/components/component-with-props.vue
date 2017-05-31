<template>
    <div>
        <p class="prop-1">{{prop1}}</p>
        <p class="prop-2">{{prop2}}</p>
    </div>
</template>

<script>
    export default{
        name: 'component-with-props',
        props: ['prop1', 'prop2'],
    };
</script>
