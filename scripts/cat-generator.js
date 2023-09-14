document.addEventListener('DOMContentLoaded', () => {
    const cat_img = document.getElementById('cat-img');
    document.getElementById('new-cat-btn').addEventListener('click', async () => {
        const url = "http://localhost:8080";
        await fetch(url, { cache: 'reload', mode: 'no-cors' })
        cat_img.src = url;
    });
});