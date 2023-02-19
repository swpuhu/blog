import Layout from './Layout.vue';
import './Layout.css';
export default {
    Layout,
    NotFound: () => 'custom 404',
    enhanceApp({ app, router, siteData }) {},
    setup() {},
};
