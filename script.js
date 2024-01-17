








/*Старался как мог, но есть ошибки, которые не знаю как исправить.
При клике по карточке фильма всплывает ошибка*/



// DOM- объекты элементов пользовательского интерфейса

const titleInput = document.getElementById('title');
const typeSelect = document.getElementById('type');
const searchButton = document.getElementById('search-button');
const statusOutput = document.getElementById('status-output');
const searchResultContainer = document.getElementById('search-result-container');





//---------------Обработка событий----------------

 

//Создание объекта сетевого запроса AJAX
const request = new XMLHttpRequest();
const apiKey = '00c4b8a8-6905-402a-a8d8-f46c843898d6'

//Состояние параметров поиска
let title, type; 
//-----------------Отправка поисковых запросов-----------------

//обработка события click на кнопке
searchButton.addEventListener('click', processInitialRequest);

//Функция обработки начального запроса
function processInitialRequest() {
    if (!titleInput.value) {
        statusOutput.innerText = 'Пустой заголовок\nПожалуйста введите название фильма / сериала';
        return;
    }

    //Отмена запроса при повторении входных данных
    if (titleInput.value == title && typeSelect.value == type) {
        statusOutput.innerText = 'Повторение - мать учения, но не сегодня.\n Введите новое название и/или тип.';
        return;
    }

    //Отмена запроса в случае несоответствия title к шаблону

    const regexp = /^[a-za-яё0-9][a-za-яё0-9 ,.!?&/\--:;'"]+$/i;

    if (!regexp.test(titleInput.value)) {
        statusOutput.innerText = 'Ошибка в названии\nНазвание должно начинаться с букв или цифр и может иметь пробелы и знаки пунктуации';
        titleInput.value = '';
        return;
    }
    //Заголовок фильма, сериала
    title = titleInput.value;
    titleInput.value = "";
    type = typeSelect.value;
        
    statusOutput.innerText = "Загрузка...";

    //Очистка предыдущего поиска
    const cinemaCards = searchResultContainer.querySelectorAll('.cinema-card');

    for (const cinemaCard of cinemaCards) {
        cinemaCard.remove();
    }
          
   const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films?order=RATING&ratingFrom=0&ratingTo=10&yearFrom=1000&yearTo=3000&type=${type}&keyword=${title}&page=1`
   
    sendRequest(url);
    
}


//Функция для отправки запроса
function sendRequest(url) {
   
 
   //Инициализация
    request.open('GET', url); 
    request.setRequestHeader('X-API-KEY', apiKey);

    //Отправка
    request.send(url)
    console.time('request');
}

//----------------Обработка поисковых результатов-------------------

//Регистрация слушателя и обработчика события на получение ответа
request.addEventListener('load', processResponse);

request.onerror = function() {
    console.log('request :>> ', request);
};
//Функция обработки ответа
function processResponse() {
    console.timeEnd('request');
    
    if (request.status == 200) {
        const typeString = typeSelect.selectedOptions[0].text;
        statusOutput.innerText = ` ${typeString} со словами в названии:  ${title}`;
        
        const response = JSON.parse(request.response);
        
        if('items' in response) {
            searchResult = response.items;
            processSearchResults(searchResult);
        
        } else {
            cinemaFullInfo = response;
            processDetails(cinemaFullInfo.items);
        }
                    
     
        console.log('response :>> ', response);
        processSearchResults(response.items);
    } else {
        console.log('request statusText :>> ', request.statusText);
    }
        
}

//Обработка результатов поиска
function processSearchResults(searchResult) {
    console.log('searchResult :>> ', searchResult);

    searchResult.forEach(function(result) {
    const {
        posterUrl: poster,
        nameRu: title,
        ratingKinopoisk: rating,
        year,
        kinopoiskId
    } = result;
    
    //Создание HTML-элементов
        const card =
`<div class="cinema-card" data-kinopoisk-id="${kinopoiskId}">
    <div class="poster">
        <img src="${poster}" alt="Poster of${title}">
    </div>
    <div class="info">
        <div class="rating-favorite-container">
            <p class="rating">Рейтинг ${rating}</p>
        </div>
        <h6 class="title">${title}</h6>
        <p class="year">Год выпуска ${year}</p>
    </div>
</div>`;
            
    //Вставка нового HTML-элемента
    searchResultContainer.insertAdjacentHTML('beforeend', card);
            
});
}

//Обработка событий клика по карточкам
searchResultContainer.addEventListener('click', processDetailResponse);

//Функция для отправки запроса детальной информации по фильму
function processDetailResponse(event) {
    const card = event.target.closest('div.cinema-card');

    if (card) {
        const kinopoiskId = card.dataset.kinopoiskId;
        const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kinopoiskId}`;
        sendRequest(url);
    }
}
//Функция для вывода детальной информации по фильму
function processDetails(cinemaFullInfo) {
    const {
        posterUrl: poster,
        ratingKinopoisk: rating,
        nameOriginal: title,
        genres,
        countries,
        year,
        shortDescription: description,
        webUrl
    } = cinemaFullInfo;



    const cinemaFullCard = 
    `<div id="fixed-container">
        <div id="cinema-full-card">
            <div class="poster">
                <img src="${poster}" alt="Poster of ${title}">
            </div>
            <div class="info">
                <p class="rating">${rating}</p>
                <h2 class="title">${title}</h2>
                <h3 class="genre">
                    ${ genres.map(item => item.genre)
                        .join(', ')
                        .replace(/^./, letter =>letter.toUpperCase()) }
                </h3>
                <h3 class="countries">
                ${ countries.map(item => item.country).join(', ') }
                </h3>
                <p class="year">${year}</p>
                <p class="description">${description}</p>
                <a href="${webUrl}" target="_blank">Ссылка на Кинопоиск</a>
            </div>
            <button>&times;</button>
        </div>
    </div>`;
     
    //вставка нового html-элемента 
    document.body.insertAdjacentHTML('beforeend', cinemaFullCard);

    //Отключение прокрутки
    document.body.style.width = getComputedStyle(document.body).width;
    document.body.style.overflow = 'hidden';

    //Закрытие окна
    const fixedContainer = document.getElementById('fixed-container');

    const removeFixedContainer = () => {
        fixedContainer.remove();
        document.body.style.width = '';
        document.body.style.overflow = '';
    }

    document.querySelector('#cinema-full-card-button')
        .addEventListener('click', function() {
            removeFixedContainer();
        }, {once: true});

    fixedContainer.addEventListener('click', function(event) {
        if (event.target.matches('#fixed-container')) {
            removeFixedContainer()
        }
    }, {once: true});
}












       









































