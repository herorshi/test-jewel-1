"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import "./plus.css";
function Plus() {
  let objDefault = {
    codeProduct: "",
    qty: "",
    weight: "",
    pricePerUnit: "",
    unit: "",
    beforeDiscount: "",
    discount: "",
    priceNet: "",
    id: uuidv4()
  };
  let defaultDocument = {
    numberDoc: "",
    dateDoc: "",
    dueDateDoc: "",
    nameCustomer: "",
    addressInvoice: "",
    addressReceive: "",
    refNumberDoc: "",
    currency: ""
  };

  const optionsUnit = [{ id: 1, name: "ชิ้น" }, { id: 2, name: "น้ำหนัก" }];
  const [storeItem, setStoreItem] = useState([]);
  const [priceNet, setPriceNet] = useState(0);
  const [discountNet, setDiscountNet] = useState(0);
  const [netSumFinal, setNetSumFinal] = useState(0);
  const [vatSumPrice, setVatSumPrice] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [note, setNote] = useState("");
  const [remark, setRemark] = useState("");
  const [storeOrder, setStoreOrder] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState(false);
  const [indexUpdate, setIndexUpdate] = useState(null);
  const [objDetail, setObjDetail] = useState(defaultDocument);

  const loadFirst = () => {
    let dataObject = [];
    
    dataObject = [...dataObject, { ...objDefault }];
    objDefault.id = uuidv4();
    dataObject = [...dataObject, { ...objDefault }];
    objDefault.id = uuidv4();
    dataObject = [...dataObject, { ...objDefault }];
    setStoreItem([...dataObject]);
    setObjDetail({ ...defaultDocument });
    setNote("");
    setRemark("");
    setStatusUpdate(false);
  };

  useEffect(() => {
    loadFirst();
  }, []);

  useEffect(
    () => {
      setTimeout(() => {
        let sum = storeItem.reduce((accumulator, currentValue) => {
          if (currentValue["codeProduct"] && currentValue["qty"] && currentValue["pricePerUnit"] && currentValue["unit"]) {
            return parseFloat(accumulator || 0) + parseFloat(currentValue["beforeDiscount"] || 0);
          } else {
            return accumulator;
          }
        }, 0);
        let sumDiscount = storeItem.reduce((accumulator, currentValue) => {
          if (currentValue["codeProduct"] && currentValue["qty"] && currentValue["pricePerUnit"] && currentValue["unit"]) {
            return (
              parseFloat(accumulator || 0) +
              (parseFloat(currentValue["discount"] * parseFloat(currentValue["beforeDiscount"] / 100)) || 0)
            );
          } else {
            return accumulator;
          }
        }, 0);

        let sumNetAfterDiscount = storeItem.reduce((accumulator, currentValue) => {
          if (currentValue["codeProduct"] && currentValue["qty"] && currentValue["pricePerUnit"] && currentValue["unit"]) {
            return parseFloat(accumulator || 0) + parseFloat(currentValue["priceNet"]);
          } else {
            return accumulator;
          }
        }, 0);

        let sumFinal = sum - sumDiscount;
        let vat = (sumFinal * 7) / 100;
        setDiscountNet(sumDiscount.toFixed(2));
        setPriceNet(sum.toFixed(2));
        setNetSumFinal(sumNetAfterDiscount.toFixed(2));
        setVatSumPrice(vat.toFixed(2));
        setGrandTotal((sumNetAfterDiscount + vat).toFixed(2));
      }, 500);
    },
    [storeItem]
  );

  const changeValue = (index, key, statusNumber = null) => async event => {
    let inputValue = event.target.value;
    if (key == "discount") {
      if (parseFloat(inputValue) > 100) {
        inputValue = 100;
      } else if (parseFloat(inputValue) < 0) {
        inputValue = 0;
      }
      50;
    }

    const numericValue = statusNumber == "isNumber" ? inputValue.replace(/\D/g, "") : inputValue;
    let updatedStoreItem = storeItem.map((item, i) => {
      if (
        (item["qty"] || (key == "qty" && inputValue)) &&
        (item["pricePerUnit"] || (key == "pricePerUnit" && inputValue)) &&
        index == i
      ) {
        let sumPrice =
          (key == "qty" ? inputValue : parseFloat(item["qty"])) *
            (key == "pricePerUnit" ? parseFloat(inputValue) : parseFloat(item["pricePerUnit"])) || 0;
        item["beforeDiscount"] = sumPrice;
        if (item["discount"] || (key == "discount" && inputValue)) {
          let discount = ((sumPrice * (key == "discount" ? inputValue : parseFloat(item["discount"]))) / 100).toFixed(2);
          item["priceNet"] = sumPrice - discount || 0;
        } else {
          item["priceNet"] = sumPrice;
        }
      }
      33;
      return i === index ? { ...item, [key]: numericValue } : item;
    });
    setStoreItem(updatedStoreItem);
  };

  const changeDetailDoc = key => event => {
    let inputValue = event.target.value;
    let dataDoc = { ...objDetail };
    dataDoc[key] = inputValue;
    setObjDetail({ ...dataDoc });
  };

  const addProduct = () => {
    let dataObject = [];
    objDefault.id = uuidv4();
    dataObject = [...storeItem, { ...objDefault }];
    setStoreItem([...dataObject]);
  };

  const addOrder = () => {
    if (!objDetail.numberDoc) {
      alert("กรุณากรอก หมายเลขเอกสาร");
      return;
    }

    if (!objDetail.dateDoc) {
      alert("กรุณากรอก วันที่ออกเอกสาร");
      return;
    }

    if (!objDetail.dueDateDoc) {
      alert("กรุณากรอก วันที่ครบกำหนด");
      return;
    }

    if (!objDetail.nameCustomer) {
      alert("กรุณากรอก ชื่อลูกค้า");
      return;
    }

    if (!objDetail.addressInvoice) {
      alert("กรุณากรอก ที่อยู่ออกใบกำกับภาษี");
      return;
    }

    if (!objDetail.addressReceive) {
      alert("กรุณากรอก ที่อยู่จัดส่ง");
      return;
    }
    if (!objDetail.refNumberDoc) {
      alert("กรุณากรอก หมายเลขเอกสารอ้างอิง");
      return;
    }

    if (!objDetail.currency) {
      alert("กรุณากรอก สกุลเงิน");
      return;
    }

    let objOrder = {
      objDetail,
      storeItem,
      priceNet,
      discountNet,
      netSumFinal,
      vatSumPrice,
      grandTotal,
      note,
      remark,
      id: uuidv4()
    };
    let dataOrder = [...storeOrder, objOrder];
    setStoreOrder([...dataOrder]);
    loadFirst();
  };

  const deleteProduct = index => {
    const newItems = storeItem.filter((_, i) => i !== index); // สร้าง array ใหม่โดยไม่รวม element ที่ index
    setStoreItem(newItems); // อัปเดต state
  };
  const deleteOrder = index => {
    if (confirm("ยืนยันลบออเดอร์")) {
      const newItems = storeOrder.filter((_, i) => i !== index);
      setStoreOrder(newItems);
    }
  };

  const updateOrder = index => {
    let orderUpdate = [...storeOrder];
    setIndexUpdate(index);
    setStatusUpdate(true);
    setStoreItem([...orderUpdate[index].storeItem]);
    setObjDetail({ ...orderUpdate[index].objDetail });
    setNote(orderUpdate[index].note);
    setRemark(orderUpdate[index].remark);
  };

  const updateOrderConfirm = () => {
    let index = indexUpdate;
    let orderItem = [...storeOrder];
    orderItem[index].storeItem = [...storeItem];
    orderItem[index].objDetail = { ...objDetail };
    orderItem[index].note = note;
    orderItem[index].remark = remark;
    orderItem[index].priceNet = priceNet;
    orderItem[index].discountNet = discountNet;
    orderItem[index].netSumFinal = netSumFinal;
    orderItem[index].vatSumPrice = vatSumPrice;
    orderItem[index].grandTotal = grandTotal;
    setStoreOrder([...orderItem]);
    loadFirst();
  };

  return (
    <>
      <div className="box-content overflow-auto">
        <div className="w-60-percent">
          <div className="box-product ">
            <input
              className="edge-input me-3 doc-input"
              value={objDetail.numberDoc}
              onChange={changeDetailDoc("numberDoc")}
              placeholder="หมายเลขเอกสาร"
            />
            <input
              placeholder="วันที่ออกเอกสาร"
              className="edge-input me-3 doc-input custom-date-input"
              value={objDetail.dateDoc}
              onChange={changeDetailDoc("dateDoc")}
            />

            <input
              className="edge-input me-3 doc-input"
              value={objDetail.dueDateDoc}
              onChange={changeDetailDoc("dueDateDoc")}
              placeholder="วันที่ครบกำหนด"
            />
            <input
              className="edge-input me-3 doc-input"
              value={objDetail.nameCustomer}
              onChange={changeDetailDoc("nameCustomer")}
              placeholder="ชื่อลูกค้า"
            />
          </div>

          <div className="mt-4 box-product">
            <input
              className="edge-input me-3 doc-input"
              value={objDetail.addressInvoice}
              onChange={changeDetailDoc("addressInvoice")}
              placeholder="ที่อยู่ออกใบกำกับภาษี"
            />
            <input
              className="edge-input me-3 doc-input"
              value={objDetail.addressReceive}
              onChange={changeDetailDoc("addressReceive")}
              placeholder="ที่อยู่จัดส่ง"
            />
            <input
              className="edge-input me-3 doc-input"
              value={objDetail.refNumberDoc}
              onChange={changeDetailDoc("refNumberDoc")}
              placeholder="หมายเลขเอกสารอ้างอิง"
            />
            <input
              className="edge-input me-3 doc-input"
              value={objDetail.currency}
              onChange={changeDetailDoc("currency")}
              placeholder="Currency"
            />
          </div>
        </div>
      </div>

      <div className="box-product">
        <div className="box-content w-60-percent bt-none br-none table-scroll">
          <div className="box-product">
            <p className=" me-auto">
              <span className="title-product"> รายการสินค้า </span>
            </p>

            <button className="pd-number bd-none btn-color text-nowrap" onClick={addProduct}>
              เพิ่มสินค้า
            </button>
          </div>

          <p className="remain-cal">*สินค้าจะถูกคำนวณเมื่อมีข้อมูล รหัสสินค้า,จำนวน,ราคาหน่วย,หน่วย,ส่วนลดถ้าไม่ใส่จะเป็น 0 </p>

          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">รหัสสินค้า</th>
                <th scope="col">จำนวน</th>
                <th scope="col">น้ำหนัก</th>
                <th scope="col">ราคา/หน่วย</th>
                <th scope="col">หน่วย</th>
                <th scope="col">ราคาก่อนส่วนลด</th>
                <th scope="col">ส่วนลด</th>
                <th scope="col">ราคาสุทธิ</th>
                <th scope="col">ลบสินค้า</th>
              </tr>
            </thead>
            <tbody>
              {storeItem.map((item, index) => (
                <tr key={item.id}>
                  <td className="pd-number">{index + 1}</td>
                  <td className="pd-number">
                    <input value={item["codeProduct"]} className="form-control" onChange={changeValue(index, "codeProduct")} />
                  </td>
                  <td className="pd-number">
                    <input value={item["qty"]} className="form-control " onChange={changeValue(index, "qty", "isNumber")} />
                  </td>
                  <td className="pd-number">
                    <input
                      value={item["weight"]}
                      className="form-control "
                      onChange={changeValue(index, "weight", "isNumber")}
                    />
                  </td>
                  <td className="pd-number">
                    <input
                      value={item["pricePerUnit"]}
                      className="form-control "
                      onChange={changeValue(index, "pricePerUnit", "isNumber")}
                    />
                  </td>
                  <td className="pd-number">
                    {/* <input value={item['unit']} className="form-control" onChange={changeValue(index,'unit','isNumber')} /> */}
                    {/* <select className="form-control"></select> */}

                    <select className="form-control" value={item["unit"]} onChange={changeValue(index, "unit")}>
                      <option value="">เลือกตัวเลือก</option> {/* ตัวเลือกเริ่มต้น */}
                      {optionsUnit.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="pd-number">
                    <input
                      disabled
                      value={item["beforeDiscount"]}
                      className="form-control "
                      onChange={changeValue(index, "beforeDiscount", "isNumber")}
                    />
                  </td>
                  <td className="pd-number">
                    <input
                      value={item["discount"]}
                      className="form-control "
                      onChange={changeValue(index, "discount", "isNumber")}
                    />
                  </td>
                  <td className="pd-number">
                    <input
                      disabled
                      value={item["priceNet"]}
                      className="form-control "
                      onChange={changeValue(index, "priceNet", "isNumber")}
                    />
                  </td>
                  <td className="pd-number">
                    <button className="pd-number bd-none btn-delete" onClick={() => deleteProduct(index)}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-50 box-product">
            <textarea
              onChange={event => setRemark(event.target.value)}
              className="color-area w-100-percent pd-number"
              placeholder="remark"
              rows="4"
              value={remark}
            />
          </div>
        </div>
        <div className="box-content w-40-percent bt-none overflow-auto mh-400">
          <p className="title-product me-auto">รายการสินค้า</p>

          <div className="box-product align-items-center ms-3">
            <span className="me-auto">ราคาสุทธิ</span>
            <input value={priceNet} disabled className="form-control-mini" />
            <span> THB </span>
          </div>

          <div className="box-product align-items-center ms-3 mt-4">
            <span className="me-auto">ส่วนลดท้ายบิล</span>
            <input value={discountNet} disabled className="form-control-mini" />
            <span> THB </span>
          </div>

          <div className="box-product align-items-center ms-3 mt-4">
            <span className="me-auto">ราคาหลังหักส่วนลด</span>
            <input value={netSumFinal} disabled className="form-control-mini" />
            <span> THB </span>
          </div>

          <div className="box-product align-items-center ms-3 mt-4">
            <span className="me-auto">Vat</span>
            <input value={vatSumPrice} disabled className="form-control-mini" />
            <span> THB </span>
          </div>

          <div className="mt-4 pd-number box-product bg-total">
            <span className="me-auto text-total">Grand Total</span>
            <span className="text-total"> {grandTotal} THB</span>
          </div>

          <div className="mt-50 box-product justify-content-center">
            <textarea
              className="color-area pd-number"
              onChange={event => setNote(event.target.value)}
              rows="4"
              cols="50"
              placeholder="note"
              value={note}
            />
          </div>
        </div>
      </div>
      <div className="box-content box-product w-100-percent bt-none">
        <button className="pd-number bd-none btn-secondary ms-auto me-3" onClick={loadFirst}>
          cancel
        </button>

        {statusUpdate ? (
          <button className="pd-number bd-none btn-color" onClick={() => updateOrderConfirm()}>
            Confirm update
          </button>
        ) : (
          <button className="pd-number bd-none btn-color " onClick={addOrder}>
            save
          </button>
        )}
      </div>

      {storeOrder.length > 0 && (
        <div className="box-content  w-100-percent bt-none">
          <div class="text-center w-100-percent">
            <span class="text-header">รายการออเดอร์</span>
          </div>
          <div className="box-product justify-content-center">
            <table className="mt-50 order-detail">
              <thead>
                <tr>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    #
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    หมายเลขเอกสาร
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    วันที่ออกเอกสาร
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    วันที่ครบกำหนด
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ชื่อลูกค้า
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ที่อยู่ออกใบกำกับภาษี
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ที่อยู่จัดส่ง
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    หมายเลขเอกสารอ้างอิง
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    สกุลเงิน
                  </th>

                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    จำนวนรายการสินค้า
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ราคาสุทธิ
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ส่วนลดท้ายบิล
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ราคาหลังหักส่วนลด
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    Vat
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    Grand Total
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    แก้ไข
                  </th>
                  <th className="pd-number border-table align-middle font-head-table" scope="col">
                    ลบ
                  </th>
                </tr>
              </thead>
              <tbody>
                {storeOrder.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center align-items-center">{index + 1}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.numberDoc}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.dateDoc}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.dueDateDoc}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.nameCustomer}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.addressInvoice}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.addressReceive}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.refNumberDoc}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.objDetail.currency}</td>

                    <td className="pd-number border-table text-center align-items-center">{item.storeItem.length}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.priceNet}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.discountNet}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.netSumFinal}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.vatSumPrice}</td>
                    <td className="pd-number border-table text-center align-items-center">{item.grandTotal}</td>

                    <td className="pd-number border-table text-center align-items-center">
                      <button className="pd-number bd-none btn-color" onClick={() => updateOrder(index)}>
                        Update
                      </button>
                    </td>
                    <td className="pd-number border-table text-center align-items-center">
                      <button className="pd-number bd-none btn-delete h-35" onClick={() => deleteOrder(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
      )}
    </>
  );
}

export default Plus;
