import React from "react";
import { useMoralis, useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { Table, Space } from "antd";
import moment from "moment";
import { Modal, Button } from "antd";

const styles = {
  table: {
    margin: "0 auto",
    padding: "10px",
    width: "1000px",
  },
};

function Transactions() {
  const { Moralis } = useMoralis();

  const contractProcessor = useWeb3ExecuteFunction();
  const { walletAddress, chainId, contractAddress, contractgABI } = useMoralisDapp();

  const queryItemFlyers = useMoralisQuery("GFDSFlyerAdded");
  const fetchFlyersList = JSON.parse(
    JSON.stringify(queryItemFlyers.data, [
      "flyerId",
      "flyerAddress",
      "startLocation",
      "destLocation",
      "startLocCoordinate",
      "destLocCoordinate",
      "weightAllowed",
      "pricePerKg",
      "phone",
      "dateOfTravel",
      "anySpecification",
    ])
  );

  const queryItemSender = useMoralisQuery("GFDSParcelSender");
  const fetchSenderlList = JSON.parse(
    JSON.stringify(queryItemSender.data, [
      "senderId",
      "senderAddress",
      "parcelWeight",
      "senderPhone",
      "datesOfTravel",
      "parcelDetail",
    ])
  );

  const queryItemParcelBooked = useMoralisQuery("GFDSParcelBooked");
  const fetchParcelBooked = JSON.parse(
    JSON.stringify(queryItemParcelBooked.data, [
      "transactionId",
      "flyerId",
      "senderId",
      "totalAmount",
      "deliveryConfirmed",
      "updatedAt",
    ])
  ).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0));
  //.filter((item) => item.offerer.toLowerCase() === walletAddress.toLowerCase()) //TODO: Filter based on logged in address

  const queryItemDeliveryConfirm = useMoralisQuery("GFDSDeliveryconfirmed");
  const fetchDeliveryConfirm = JSON.parse(JSON.stringify(queryItemDeliveryConfirm.data, ["transactionId"]));

  async function confirmDelivery(transId) {
    console.log("_transactionId:", transId);
    const ops = {
      contractAddress: contractAddress,
      functionName: "confirmDelivery",
      abi: contractgABI,
      params: {
        _transactionId: transId,
      },
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success");
        succPurchase("Delivery Confirmed");
      },
      onError: (error) => {
        console.log(error);
        failPurchase("Issue while Confirming Delivery");
      },
    });
  }

  function succPurchase(msg) {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: msg,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failPurchase(msg) {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: msg,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function getFlyerDetail(flyerId) {
    const flyer = fetchFlyersList?.find((e) => e.flyerId === flyerId);
    return `${flyer?.startLocation} - ${flyer?.destLocation}`;
  }

  function getTravelDate(flyerId) {
    const flyer = fetchFlyersList?.find((e) => e.flyerId === flyerId);
    return flyer?.dateOfTravel;
  }

  function getTotalWeight(senderId) {
    const sender = fetchSenderlList?.find((e) => e.senderId === senderId);
    return sender?.parcelWeight;
  }

  function getTotalCost(transId) {
    const parcelBooked = fetchParcelBooked?.find((e) => e.transactionId === transId);
    return parcelBooked?.totalAmount;
  }

  function getConfirmation(transId) {
    const deliveryConfirmation = fetchDeliveryConfirm?.find((e) => e.transactionId === transId);
    return deliveryConfirmation?.transactionId === transId ? true : false;
  }

  const columnsGFDS = [
    {
      title: "Transaction Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Flyer Detail",
      key: "flyerDetail",
      render: (text, record) => (
        <Space size="middle">
          <span>
            {getFlyerDetail(record.flyerId)} #{record.flyerId}
          </span>
        </Space>
      ),
    },
    {
      title: "Travel Date",
      key: "travelDate",
      render: (text, record) => (
        <Space size="middle">
          <span>{getTravelDate(record.flyerId)}</span>
        </Space>
      ),
    },
    {
      title: "Total Weight",
      key: "totalWeight",
      render: (text, record) => (
        <Space size="middle">
          <span>{getTotalWeight(record.senderId)} kg</span>
        </Space>
      ),
    },
    {
      title: "Total Cost",
      key: "totalCost",
      render: (text, record) => (
        <Space size="middle">
          <span>{Moralis.Units.FromWei(getTotalCost(record.transactionId))} MATIC</span>
        </Space>
      ),
    },
    {
      title: "Delivery Confirmation",
      key: "confirmation",
      render: (text, record) => (
        <Space size="middle">
          <span style={{ justifyContent: "center" }}>
            <Button onClick={() => confirmDelivery(record.transactionId)}>Confirm</Button>
          </span>
        </Space>
      ),
    },
  ];

  const dataGDFS = fetchParcelBooked?.map((item, index) => ({
    key: index,
    date: moment(item.updatedAt).format("DD-MM-YYYY"),
    flyerId: item.flyerId,
    senderId: item.senderId,
    transactionId: item.transactionId,
  }));

  return (
    <>
      <div>
        <div style={styles.table}>
          <Table columns={columnsGFDS} dataSource={dataGDFS} />
        </div>
      </div>
    </>
  );
}

export default Transactions;
