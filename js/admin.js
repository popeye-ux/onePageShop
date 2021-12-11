const api_path = "popeye";
const token = "f6CAh3OnODNWycMtbXkXKqvTcb92";
const baseUrl = "https://livejs-api.hexschool.io";

let orderData;
let chartData;

//DOM 
const orderPageTable = document.querySelector('.orderPage-table');
const discardAllBtn = document.querySelector('.discardAllBtn');

// 取得後台訂單列表
function getOrderList() {
  axios.get(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      orderData = response.data.orders;
      console.log(orderData);
      renderOrderList();
      getChartData();
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
      }
    });
}

function renderOrderList() {
  let orderListStr = `<thead>
        <tr>
            <th>訂單編號</th>
            <th>聯絡人</th>
            <th>聯絡地址</th>
            <th>電子郵件</th>
            <th>訂單品項</th>
            <th>訂單日期</th>
            <th>訂單狀態</th>
            <th>操作</th>
        </tr>
    </thead>`
  let str = `<thead>
      <tr>
          <th>訂單編號</th>
          <th>聯絡人</th>
          <th>聯絡地址</th>
          <th>電子郵件</th>
          <th>訂單品項</th>
          <th>訂單日期</th>
          <th>訂單狀態</th>
          <th>操作</th>
      </tr>
  </thead>`;
  orderData.forEach((item) => {
    let productStr = '';
    let products = item.products;
    products.forEach((productItem) => {
      productStr += `<p>${productItem.title}</p>`
    })
    str += `
        <tr>
                        <td>${item.id}</td>
                        <td>
                          <p>${item.user.name}</p>
                          <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                          ${productStr}
                        </td>
                        <td>${new Date(item.createdAt * 1000).toLocaleDateString()}</td>
                        <td class="orderStatus">
                          <a href="#" class="handle" data-id="${item.id}">${item.paid ? '已處理' : '未處理'}</a>
                        </td>
                        <td>
                          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                        </td>
                    </tr>
        `
  })
  orderPageTable.innerHTML = str;
}


// 修改訂單狀態及刪除單一訂單資料 
orderPageTable.addEventListener('click', function (e) {
  e.preventDefault();
  let orderId = e.target.getAttribute('data-id');
  let paidStatus;
  orderData.forEach((item) => {
    if (item.id === orderId) {
      paidStatus = !item.paid;
      console.log(paidStatus);
    }
  })
  if (e.target.getAttribute('class') === 'handle') {
    editOrderList(orderId, paidStatus);
  }
  if (e.target.getAttribute('class') === 'delSingleOrder-Btn') {
    deleteOrderItem(orderId);
  }
})
// 修改訂單 API
function editOrderList(orderId, paidStatus) {
  axios.put(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": paidStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      getOrderList();
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
      }
    });
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      //getOrderlist 已經有呼叫getChartData(); 
      getOrderList();
      //為何要再呼叫一次getChartData(); 
      getChartData();
    })
}

// 刪除全部訂單
discardAllBtn.addEventListener('click', function (e) {
  e.preventDefault;
  if (e.target.getAttribute('class') === 'discardAllBtn') {
    deleteAllOrder()
  }
})

// 刪除全部訂單 API
function deleteAllOrder() {
  axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      getOrderList();
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        if (!error.response.data.status) {
          alert('目前訂單列表沒有任何訂單！')
        }
      }
    });
}



//畫圓餅圖
function getChartData() {
  let totalProduct = {};
  orderData.forEach((item) => {
    let productItems = item.products;
    productItems.forEach((item) => {
      if (totalProduct[item.title] === undefined) {
        totalProduct[item.title] = (item.price * item.quantity);
      } else {
        totalProduct[item.title] += (item.price * item.quantity);
      }
    })
  })
  console.log(totalProduct);
  let roughData = [];
  let productItemsAry = Object.keys(totalProduct);
  console.log(productItemsAry);
  productItemsAry.forEach((item) => {
    let obj = {};
    obj.itemName = item;
    obj.totalCost = totalProduct[item];
    roughData.push(obj);
  })
  console.log(roughData);
  roughData.sort(function (a, b) {
    return a.totalCost < b.totalCost ? 1 : -1;
  });
  console.log(roughData)
  let sequence = [];
  roughData.forEach((item) => {
    let ary = [];
    ary.push(item.itemName);
    ary.push(item.totalCost);
    sequence.push(ary);
  })
  console.log(sequence);
  let chartData = sequence.splice(0, 3);
  console.log(chartData);
  let otherAry = [];
  let other = '其他';
  let othersCost = 0;
  sequence.forEach((item) => {
    othersCost += item[1];
  })
  otherAry.push(other);
  otherAry.push(othersCost);
  chartData.push(otherAry);
  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: chartData,
      // colors: {
      //   "Louvre 雙人床架": "#DACBFF",
      //   "Antony 雙人床架": "#9D7FEA",
      //   "Anty 雙人床架": "#5434A7",
      //   "其他": "#301E5F",
      // }
    },
    color: {
      pattern: ["#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2"]
    },
  });
}

getOrderList();
