<template>
    <div class="root items-center">
        <div class="root__item root__item--small">
            {{title}}
        </div>
        <input class="input-text" type="number" placeholder="0.0" @input="changeValue" :value="value"/>
    </div>
</template>
<script>
    export default {
        name: 'InputField',
        data() {
            return {
                selectedCoin: null,
                currentValue: 0
            };
        },
        props: {
            title: {type: String},
            value: {type: String}
        },
        methods: {
            changeValue(event) {
                var value = event.target.value
                this.$emit('input',value)
            }
        }
    };
</script>

<style scoped>
    input {
        outline: none;
    }

    .root {
        width: 100%;
        display: flex;
        padding: 20px;
        background-color: var(--q-color-secondary);
        border-radius: 10px;
        justify-content: space-between;
        /* align-items: center; */
    }

    .root__item {
        width: 100%;
    }

    .root__item--small {
        max-width: 35%;
    }

    .selection {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .selection > .icon {
        width: 60px;
        height: 60px;
        background: #66666650;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .selection > .field {
        padding: 0 10px;
        color: #999;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .selection > .field > .title {
        font-size: 0.7rem;
    }

    .selection > .field > .value {
        font-size: 1.5rem;
    }

    .selection > .field > .value button {
        font-size: 0.7rem;
        background: transparent;
        border: 1px solid #666666;
        color: #666666;
        padding: 3px 7px;
        border-radius: 20px;
    }

    .selection > .field > .value button:hover {
        background-color: #ddd;
    }

    .input-text {
        width: 100%;
        font-weight: 700;
        padding: 10px;
        border-radius: 10px;
        font-size: 1.5rem;
        color: #bbb;
        background-color: var(--q-color-dark);
        border: none;
    }

    .input-text:focus {
        color: #f1f1f1;
    }

    .modal {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #0000006c;
        backdrop-filter: blur(10px);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal__content {
        width: 450px;
        padding: 20px;
        border: 1px double transparent;
        border-radius: 10px;
        background-image: linear-gradient(224deg, var(--q-color-secondary), var(--q-color-dark)),
        linear-gradient(224deg, var(--q-color-info), var(--q-color-primary));
        font-weight: bold;
        color: #fff;
        background-origin: border-box;
        background-clip: padding-box, border-box;
    }

    .model__content__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;
    }

    .model__content__item:first-child {
        margin-top: 0;
    }

    .model__content__item:last-child {
        margin-bottom: 0;
    }

    .model__content__item > .btn {
        background: #0993ec33;
        width: 100%;
        margin-top: 15px;
        border: none;
        border-radius: 10px;
        padding: 15px;
        font-size: 1rem;
        color: #0993ec;
        cursor: pointer;

    }

    .model__content__item > .btn:hover {
        background-color: #0993ec60;
    }

    .search {
        width: 100%;
        border: 1px double transparent;
        border-radius: 10px;
        padding: 10px;
        background-image: linear-gradient(224deg, var(--q-color-secondary), var(--q-color-dark)),
        linear-gradient(224deg, var(--q-color-info), var(--q-color-primary));
        font-weight: bold;
        color: #fff;
        background-origin: border-box;
        background-clip: padding-box, border-box;
    }

    .common-list {
        display: flex;
        flex-wrap: wrap;
    }

    .common-list__item {
        display: flex;
        align-items: center;
    }

    .common-list__item > .logo {
    }

    .common-list__item > .title {
        color: #999999;
        margin-left: 5px;
    }

    .lists {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        width: 100%;
        max-height: 300px;
    }

    .list {
        display: flex;
        align-items: center;
    }

    .list__item {
        padding: 5px;
        color: #999;
    }

    .list__item > .value {
        font-size: .8rem;
    }

    .list__item > .name {
        font-size: .8rem;
    }

    @media (max-width: 600px) {
        .root {
            flex-direction: column;
        }

        .root__item--small {
            max-width: 100%;
        }

        .selection {
            padding-bottom: 10px;
        }
    }
</style>