let user = { id: null, role: null, class_id: null, flowers: 0 };
let questions = 0;
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function loadUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) user = JSON.parse(savedUser);
    updateUserInfo();
}

function updateUserInfo() {
    document.getElementById('userInfo').innerText = user.role ? `Chào ${user.role === 'student' ? 'học sinh' : user.role === 'parent' ? 'phụ huynh' : 'admin'}!` : '';
    if (user.role === 'student' && user.class_id) document.getElementById('userInfo').innerText += ` Lớp ${user.class_id}`;
}

function login() {
    window.location.href = '../php/login.php'; // Sửa đường dẫn
}

function logout() {
    localStorage.removeItem('user');
    user = { id: null, role: null, class_id: null, flowers: 0 };
    updateUserInfo();
    document.getElementById('content').innerHTML = '<p>Vui lòng <a href="../php/login.php">đăng nhập</a>.</p>'; // Sửa đường dẫn
}

document.getElementById('logout').addEventListener('click', logout);

function showClassSelection() {
    const classes = [1, 2, 3, 4, 5];
    let html = '<h2>Chọn lớp</h2><div class="grid grid-cols-5 gap-2">';
    classes.forEach(cls => {
        html += `<button class="bg-green-500 text-white p-2 rounded hover:bg-green-600" onclick="selectClass(${cls})">Lớp ${cls}</button>`;
    });
    html += '</div>';
    document.getElementById('content').innerHTML = html;
}

function selectClass(cls) {
    if (user.role === 'student') {
        user.class_id = cls;
        localStorage.setItem('user', JSON.stringify(user));
        updateUserInfo();
        showLessonMenu();
    } else {
        alert('Chỉ học sinh mới được chọn lớp!');
    }
}

function showLessonMenu() {
    document.getElementById('content').innerHTML = `
        <h2>Menu bài học - Lớp ${user.class_id}</h2>
        <ul>
            <li><a href="#" onclick="showReview()">Ôn tập</a></li>
            <li><a href="#" onclick="startGame()">Trò chơi đố vui</a></li>
        </ul>
    `;
}

function showReview() {
    document.getElementById('content').innerHTML = '<h2>Ôn tập</h2><p>Chọn lớp để ôn tập (hiện tại: Lớp ' + user.class_id + ')</p>';
}

function startGame() {
    const numbers = Array(9).fill().map(() => Math.floor(Math.random() * 9) + 1);
    const op1 = Math.floor(Math.random() * 5) + 1;
    const op2 = Math.floor(Math.random() * 5) + 1;
    const correct = op1 + op2;
    let html = `<h2>Trò chơi đố vui</h2><p>${op1} + ${op2} = ?</p><div class="game-grid">`;
    numbers.forEach(num => {
        html += `<div class="game-cell" onclick="checkAnswer(event, ${num}, ${correct})">${num}</div>`; // Thêm event
    });
    html += '</div>';
    document.getElementById('content').innerHTML = html;
    questions = 0;
}

function checkAnswer(event, selected, correct) {
    questions++;
    const cell = event.target;
    if (parseInt(selected) === correct) {
        cell.classList.add('correct');
        createFireworks();
        if (questions === 10) {
            user.flowers++;
            localStorage.setItem('user', JSON.stringify(user));
            alert(`Chúc mừng! Bạn nhận 1 bông hoa. Tổng: ${user.flowers}`);
            if (user.flowers >= 10) showGiftExchange();
            startGame();
        } else {
            setTimeout(() => startGame(), 1000);
        }
    } else {
        cell.classList.add('wrong');
        setTimeout(() => {
            cell.classList.remove('wrong');
            startGame();
        }, 1000);
    }
}

function createFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function showFlowers() {
    document.getElementById('content').innerHTML = `
        <h2>Bông hoa của bé</h2>
        <p>Bạn có <strong>${user.flowers}</strong> bông hoa.</p>
        ${user.flowers >= 10 ? '<button onclick="exchangeGift()" class="bg-yellow-500 text-white p-2 rounded">Đổi quà</button>' : ''}
        <img src="images/flower.png" alt="Flower" class="flower">
    `;
}

function exchangeGift() {
    if (user.flowers >= 10) {
        user.flowers -= 10;
        user.gifts++;
        localStorage.setItem('user', JSON.stringify(user));
        alert('Chúc mừng! Bạn đã đổi 1 phần quà. Thông báo đã gửi đến admin.');
        console.log(`Notification: User ${user.id} đổi quà`);
        showFlowers();
    }
}

function loadContent(hash) {
    switch (hash) {
        case '#class': showClassSelection(); break;
        case '#review': showReview(); break;
        case '#game': startGame(); break;
        case '#flowers': showFlowers(); break;
        default: document.getElementById('content').innerHTML = '<p>Chọn mục từ menu.</p>';
    }
}

window.addEventListener('hashchange', () => loadContent(window.location.hash));
loadUser();
loadContent(window.location.hash || '#class');

if (!user.role) login();
