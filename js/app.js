//api串接基本設定
const api_path = "popeye";
const token = "f6CAh3OnODNWycMtbXkXKqvTcb92";
const baseUrl = "https://livejs-api.hexschool.io";

//串接變數
let productData;
let addCartData = {};

let allCartData;


//DOM
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const shoppingCartBody = document.querySelector('.shoppingCartBody');
console.log(shoppingCartBody);
const totalAmountMoney = document.querySelector('.totalAmountMoney');
const cartListCount = document.querySelector('.cartList-count');
const discardAllBtn = document.querySelector('.discardAllBtn');
const orderInfoForm = document.querySelector('.orderInfo-form');
const inputs = document.querySelectorAll('input[type=text],input[type=tel],input[type=email]');


//axios 取得產品列表 API
function getProductList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/products`).
        then(function (response) {
            productData = response.data.products;
            renderProductWrap();
            renderSelect();
        })
        .catch(function (error) {
            console.log(error.response.data)
        })
}


//購物車開始
//axios 取得購物車列表 API
function getCartList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`).
        then(function (response) {
            getCartListData = response.data;
            console.log(getCartListData);
            allCartData = response.data.carts;
            //呼叫渲染購物車列表的函式
            console.log(allCartData);

            renderCartTable(getCartListData);
        })
        .catch(function (error) {
            console.log(error.response.data)
        })
}

//監聽加入購物車按鈕
productWrap.addEventListener('click', listenAddCart)
//監聽加入購物車按鈕 執行加入購物車函式
function listenAddCart(e) {
    e.preventDefault();
    let id = e.target.getAttribute('data-productId');
    if (e.target.getAttribute('class') !== "addCardBtn") {
        return;
    }
    addCartData.productId = id;
    addCartData.quantity = 1;
    // 累加購物車產品數量
    console.log(addCartData);
    allCartData.forEach((item) => {
        if (id == item.product.id) {
            addCartData.quantity = item.quantity;
            addCartData.quantity += 1;
        }
    })
    alert('成功加入購物車');
    addCartItem(addCartData);
}
// axios 加入購物車 API
function addCartItem(addCartData) {
    axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, {
        data: addCartData
    })
        .then(function (response) {
            // console.log(response.data);
            getCartList();
        })
}

//刪除購物車特定單品
shoppingCartBody.addEventListener('click', listenDelCartItem);
function listenDelCartItem(e) {
    e.preventDefault();
    let cartId = e.target.getAttribute('data-cartId');
    let id = e.target.dataset.id;
    let num = e.target.dataset.num;
    console.log(e.target.getAttribute('class'));
    if (e.target.getAttribute('data-del') == 'deleteOne') {
        deleteCartItem(cartId);
    } else if (e.target.getAttribute('class') == "discardAllBtn") {
        deleteAllCartList();
    }
    if (e.target.getAttribute('id') === "addRemove") {
        editCartNum(num, id);
    }
    if (e.target.getAttribute('id') === "delSingleBtnA") {
        deleteCartItem(id);
    }
    console.log(num, id);

}

// axios刪除購物車內特定產品 API
function deleteCartItem(cartId) {
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then(function (response) {
            // console.log(response.data);
            getCartList();
        })
}
//刪除所有品項
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    deleteAllCartList();
})
//刪除所有品項API
function deleteAllCartList() {
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            // console.log(response.data);
            getCartList();
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.log(error.response.data);
                if (!error.response.data.status) {
                    alert('購物車內已經沒有商品了！');
                }
            }
        });
}
//渲染購物車列表
function renderCartTable(newCartData) {
    let str = "";
    if (allCartData.length === 0) {
        str = `<tr style="color:#C72424;border-bottom: 0;text-align:center;"><td >購物車內已經沒有商品囉！！！</td><td></td><td></td><td></td></tr>`
    }
    allCartData.forEach((item) => {
        //每項產品的總價
        let totalPrice = item.product.price * item.quantity;
        str += `
        <tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="${item.product.title}">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$ ${item.product.price}</td>
                        <td>
                        <a href="#" ><span class="material-icons cartAmount-icon" id="addRemove" data-num="${item.quantity - 1}" data-id="${item.id}">remove</span></a>
                        <span class="itemQuantity">${item.quantity}</span>
                        <a href="#" ><span class="material-icons cartAmount-icon" id="addRemove" data-num="${item.quantity + 1}" data-id="${item.id}">add</span></a>
                        </td>
                        <td>NT$ ${totalPrice}</td>
                        <td class="discardBtn" >
                            <a href="#" class="material-icons" data-del ="deleteOne" data-cartId = ${item.id}>
                                clear
                            </a>
                        </td>
                    </tr>
        `
    })
    shoppingCartBody.innerHTML = str;
    totalAmountMoney.innerHTML = `NT$${getCartListData.finalTotal}`;

}
//修改購物車內單品數量
function editCartNum(num, id) {
    if (num > 0) {
        let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
        let data = {
            data: {
                id: id,
                quantity: parseInt(num)
            }
        }
        axios.patch(url, data)
            .then(function (res) {
                console.log(data);
                getCartList();;
            })
            .catch(function (error) {
                console.log(error);
            })
    } else {
        deleteCartItem(id);
    }
}




//購物車結束

// 送出購買訂單 表單取值
orderInfoForm.addEventListener('submit', listenSendOrder);
function listenSendOrder(e) {
    e.preventDefault();
    const formData = [...e.target];
    formData.pop();
    let orderObj = {};
    formData.forEach((item) => {
        let objName = item.getAttribute('data-form');
        orderObj[objName] = item.value.trim();
    })
    submitCheck();
    createOrder(orderObj);
}
// 送出購買訂單 顧客資訊表單 API 
function createOrder(orderObj) {
    axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/orders`,
        {
            "data": {
                "user": orderObj
            }
        }
    )
        .then(function (response) {
            // console.log(response.data);
            getCartList();
            alert('訂購成功！！！')
            // deleteAllCartList();
        })
        .catch(function (error) {
            // console.log(error.response.data);
            if (error.response.data.message === '當前購物車內沒有產品，所以無法送出訂單 RRR ((((；゜Д゜)))') {
                alert('購物車內沒有商品喔！！！');
            }
        })
}
//顧客資訊表單 驗證
const constraints = {
    "姓名": {
        presence: {
            message: "是必填欄位"
        }
    },
    "電話": {
        numericality: {
            onlyInteger: true, // 只能是整數
            greaterThanOrEqualTo: 0, // 只能大於等於零
            message: "必須是數字"
        },
        presence: {
            message: "是必填欄位"
        }
    },
    "Email": {
        email: {
            message: "不是正確格式"
        },
        presence: {
            message: "是必填欄位"
        }
    },
    "寄送地址": {
        presence: {
            message: "是必填欄位"
        }
    }
}
inputs.forEach((item) => {
    item.addEventListener('change', function () {
        item.nextElementSibling.textContent = '';
        let errors = validate(orderInfoForm, constraints);
        // console.log(errors);
        if (errors) {
            Object.keys(errors).forEach((keys) => {
                // console.log(keys);
                document.querySelector(`[data-message = "${keys}"]`).textContent = errors[keys];
            })
        }
    })
})

function submitCheck() {
    let errors = validate(orderInfoForm, constraints);
    inputs.forEach((item) => {
        // console.log(errors);
        if (errors) {
            Object.keys(errors).forEach((keys) => {
                // console.log(keys);
                document.querySelector(`[data-message = "${keys}"]`).textContent = errors[keys];
            })
        }
    })
    if (errors) {
        alert('有些資訊沒有填寫喔！！！');
    }
}

//渲染產品列表
function renderProductWrap(newData = productData) {
    let productListStr = '';
    //產品列表樣板 ${item.id}
    newData.forEach((item) => {
        productListStr += `                
                <li class="productCard">
                    <h4 class="productType">新品</h4>
                    <img src="${item.images}" alt="${item.title}">
                    <a href="#" class="addCardBtn" data-productId="${item.id}">加入購物車</a>
                    <h3>${item.title}</h3>
                    <del class="originPrice">NT$${item.origin_price}</del>
                    <p class="nowPrice" >NT$${item.price}</p>
                </li>
                `
    })
    productWrap.innerHTML = productListStr;
}

//渲染產品下拉選單
function renderSelect() {
    let allProductCategory = [];
    productData.forEach((item) => {
        allProductCategory.push(item.category)
    })
    let selectItem = allProductCategory.filter((item, index, array) => {
        return array.indexOf(item) === index;
    })
    // console.log(selectItem);
    let selectListStr = '<option value="全部" selected>全部</option>';
    selectItem.forEach((item) => {
        selectListStr += `
        <option value="${item}">${item}</option>
        `
    })
    productSelect.innerHTML = selectListStr;
}


//改變下拉選單，重新渲染產品列表
//事件監聽
productSelect.addEventListener('change', changeSelect);
function changeSelect(e) {
    const filterStr = e.target.value;
    // console.log(filterStr);
    let changeValue = productData.filter((item) => item.category === filterStr)
    filterStr === '全部' ? renderProductWrap() : renderProductWrap(changeValue);
}



//init
function init() {
    getProductList()
    getCartList()
}
init()
