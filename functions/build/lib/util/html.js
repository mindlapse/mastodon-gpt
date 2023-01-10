import striptags from "striptags";
export const extractText = (html) => {
    return striptags(html)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, '\'')
        .replace(/&#x3A;/g, ':')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
};
