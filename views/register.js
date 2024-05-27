document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmpassword = document.getElementById('confirmpassword').value;

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, confirmpassword })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Registro bem-sucedido!');
        // Você pode redirecionar o usuário para a página de login aqui
    } else {
        alert(`Erro: ${data.msg}`);
    }
});
