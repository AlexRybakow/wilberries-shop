const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

const buttonCart = document.querySelector ('.button-cart');
const modalCart = document.querySelector ('#modal-cart');
const longGoodsList = document.querySelector('.long-goods-list');
const navigationLink = document.querySelectorAll('.navigation-link');
const cartTableGoods = document.querySelector('.cart-table__goods')
const cartTableTotal = document.querySelector('.card-table__total')
const cartCount = document.querySelector('.cart-count')

const getGoods = async () => {
	const result = await fetch('db/db.json');
	if(!result.ok) {
		throw 'Ошибочка вышла' + result.status
	}
	return await result.json();
};

const cart = {
	cartGoods: [],
	countCartGoods() {
     return this.cartGoods.length;
	},

	countQuantity() {
    const count = this.cartGoods.reduce((sum, item)=> {
		return sum + item.count;
	},0) 
    cartCount.textContent = count ? count : '';
	},
	
	clearCart() {
	 this.cartGoods.length = 0;
	 this.countQuantity();
	 this.renderCart();
	},

	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({id,name,price,count}) => {
		const trGood = document.createElement('tr');
		trGood.className = 'cart-item';
		trGood.dataset.id =id;
		trGood.innerHTML = `
		<td>${name}</td>
		<td>${price}</td>
		<td><button class="cart-btn-minus">-</button></td>
		<td>${count}</td>
		<td><button class="cart-btn-plus">+</button></td>
		<td>${price * count}</td>
		<td><button class="cart-btn-delete">x</button></td>
		`
		cartTableGoods.append(trGood);
		})

		const totalPrice = this.cartGoods.reduce((sum, item) => {
         return sum + item.price * item.count
		}, 0)

		cartTableTotal.textContent = totalPrice + '$';
		
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
			.then(data => data.find(item => item.id === id)) 
			.then(({id, name, price}) => {
				this.cartGoods.push({
				id,
				name,
				price,
				count:1
				})

				})
			}
			this.countQuantity();
		},
	
	deleteGoods(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.countQuantity();
		this.renderCart();
	},
	plusGood(id){
		for(const item of this.cartGoods) {
			if(item.id === id) {
				item.count++;
				break;
			}
			
		}
		this.countQuantity();
		this.renderCart();
	},
	minusGood(id){
		for(const item of this.cartGoods) {
			if(item.id === id) {
				if(item.count <=1) {
					this.deleteGoods(id);
				} else {
					item.count--;
				}
				break;
			}
			
		}
		this.countQuantity();
		this.renderCart();
	},
}

document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
	if(addToCart) {
		cart.addCartGoods(addToCart.dataset.id)
	}
})



cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	if(target.tagName === 'BUTTON') {
		const parent = target.closest('.cart-item');
		
		if(target.classList.contains('cart-btn-delete')) {
			cart.deleteGoods(parent.dataset.id);
		}
		if(target.classList.contains('cart-btn-minus')) {
			cart.minusGood(parent.dataset.id);
		}
		if(target.classList.contains('cart-btn-plus')) {
			cart.plusGood(parent.dataset.id);
		}
	}
	
})

const openModal = () => {
	cart.renderCart();
	modalCart.classList.add('show')
};

const closemodal = () => {
	modalCart.classList.remove('show')
};

buttonCart.addEventListener('click',openModal);

modalCart.addEventListener('click', function(event) {
	const target = event.target;
	if(target.classList.contains('overlay') || target.classList.contains('modal-close')) {
		closemodal()
	}
})

function smoothScroll() {
	const scrollLinks = document.querySelectorAll('a.scroll-link');

	for (const scrollLink of scrollLinks) {
		scrollLink.addEventListener('click', event => {
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior:'smooth',
				block:'start',
			})
		})
	}
}

smoothScroll()



const createCard = function({label, img, name, description, id, price}) {
	const card = document.createElement('div');

	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `<div class="goods-card">
	${label ? `<span class="label">${label}</span>` : ''}
	<img src="db/${img}" alt="${name}" class="goods-image">
	<h3 class="goods-title">${name}</h3>
	<p class="goods-description">${description}</p>
	<button class="button goods-card-btn add-to-cart" data-id="${id}">
		<span class="button-price">$${price}</span>
	</button>
</div>`;
return card
};

const renderCard = function(data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	
    longGoodsList.append(...cards)
	
	document.body.classList.add('show-goods')
}




	const more = document.querySelector('.more');
	more.addEventListener('click', event => {
		event.preventDefault();
		getGoods().then(renderCard)
})




const filterGoods = function(field,value) {
	getGoods().then(data => data.filter(good => good[field] === value))
	.then(renderCard)
}

navigationLink.forEach(function(link) {
	link.addEventListener('click', function(event) {
		event.preventDefault;
		const field = link.dataset.field;
		const value = link.textContent;
		filterGoods(field,value);
	})
})

const allItems = document.getElementById('all-items')

allItems.addEventListener('click', event => {
	event.preventDefault();
	getGoods().then(renderCard)
})

const postData = dataUser => fetch('server.php', {
	method: 'POST',
	body: dataUser,
})

const validForm = (formData) => {
  let valid = false;
  for(const[,value] of formData) {
	  if(value.trim()) {
		  valid = true;
	  } else{
		  valid = false
		  break;
	  }
  }
  return valid;
}

const modalForm = document.querySelector('.modal-form')

modalForm.addEventListener('submit', event => {
	event.preventDefault();

	const formData = new FormData(modalForm);
	if(validForm(formData)&& cart.countCartGoods()) {
		formData.append('order',JSON.stringify(cart.cartGoods));
		postData(formData)
		.then(response => {
			if(!response.ok) {
				throw new Error(response.status)
			}
			alert('Ваш заказ успешно отправлен, с вами свяжутся в ближайшее время')
		})
		.catch(err => {
			alert('К сожалению, произошла ошибка, повторите попытку позже');
			console.error(err)
		})
		.finally(() => {
			closemodal();
			modalForm.reset();
			cart.clearCart();	
		})
	} else {
		if(!cart.countCartGoods()) {
			alert('Добавьте товары в корзину')
		} if(!validForm(formData)) {
			alert('Неправильно заполнены поля')
		}
		
	}
	
})