import React from "react";
import { Modal, Button, Input, Spin } from "antd";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useState, useEffect } from "react";
import { useMoralis, useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import RentalsMap from "../components/RentalsMap";
import "./Flyers.css";

const Flyers = () => {
  const { walletAddress, contractAddress, contractgABI } = useMoralisDapp();
  const [mapZoom, setmapZoom] = useState(13);
  const { Moralis } = useMoralis();
  const [coOrdinates, setCoOrdinates] = useState([]);
  const contractProcessor = useWeb3ExecuteFunction();
  const [visibleAddFlyer, setVisibleAddFlyer] = useState(false);
  const [visibleAddParcel, setVisibleAddParcel] = useState(false);
  const [loading, setLoading] = useState(false);

  const [flyerOrigin, setFlyerOrigin] = useState("");
  const [flyerOriginCoordinate, setFlyerOriginCoordinate] = useState(0);
  const [flyerDestination, setFlyerDestination] = useState("");
  const [flyerDestCoordinate, setFlyerDestCoordinate] = useState("");
  const [weightAllowed, setWeightAllowed] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [flyerPhone, setFlyerPhone] = useState("");
  const [dateOfTravel, setDateOfTravel] = useState("");
  const [specification, setSpecification] = useState("");
  const [currentFlyerId, setcurrentFlyerId] = useState(0);

  const [parcelWeight, setParcelWeight] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [parcelDetail, setParcelDetail] = useState("");
  const [totalParcelCost, setTotalParcelCost] = useState(0);

  useEffect(() => {
    //console.log("useeffort");
  }, []);

  const queryItemFlyers = useMoralisQuery("GFDSFlyerAdded");
  const flyersList = JSON.parse(
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

  async function addFlyer() {
    setLoading(true);

    const ops = {
      contractAddress: contractAddress,
      functionName: "addFlyer",
      abi: contractgABI,
      params: {
        _flyerAddress: walletAddress,
        _startLocation: flyerOrigin,
        _destLocation: flyerDestination,
        _startLocCoordinate: flyerOriginCoordinate,
        _destLocCoordinate: flyerDestCoordinate,
        _weightAllowed: parseInt(weightAllowed),
        _pricePerKg: Moralis.Units.ETH(pricePerKg),
        _phone: flyerPhone,
        _dateOfTravel: dateOfTravel,
        _anySpecification: specification,
      },
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success");
        setLoading(false);
        setVisibleAddFlyer(false);
        succPurchase("New Flyer has been added");
      },
      onError: (error) => {
        setLoading(false);
        console.log(error);
        setVisibleAddFlyer(false);
        failPurchase("Issue while adding Flyer");
      },
    });
  }

  async function sendParcel() {
    setLoading(true);
    console.log("_flyerId:", currentFlyerId);
    console.log("_senderAddress:", walletAddress);
    console.log("_parcelWeight:", parcelWeight);
    console.log("_senderPhone:", customerPhone);
    console.log("_datesOfTravel:", "12-12-2022");
    console.log("_parcelDetail:", parcelDetail);
    console.log(Moralis.Units.ETH(totalParcelCost));
    const ops = {
      contractAddress: contractAddress,
      functionName: "bookParcel",
      abi: contractgABI,
      params: {
        _flyerId: parseInt(currentFlyerId),
        _senderAddress: walletAddress,
        _parcelWeight: parseInt(parcelWeight),
        _senderPhone: customerPhone,
        _datesOfTravel: "12-12-2022",
        _parcelDetail: parcelDetail,
      },
      msgValue: Moralis.Units.Token(totalParcelCost, 18),
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success");
        setLoading(false);
        setVisibleAddParcel(false);
        succPurchase("Parcel Pick-up registration Booked");
      },
      onError: (error) => {
        setLoading(false);
        console.log(error);
        setVisibleAddParcel(false);
        failPurchase("Issue while Booking Parcel registration");
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

  function setLocation(e) {
    let cords = [];
    cords.push({ lat: e.startLocCoordinate.split(",")[0], lng: e.startLocCoordinate.split(",")[1] });
    cords.push({ lat: e.destLocCoordinate.split(",")[0], lng: e.destLocCoordinate.split(",")[1] });
    const distance = Math.abs(e.startLocCoordinate.split(",")[0] - e.destLocCoordinate.split(",")[0]);
    setmapZoom(setZoom(distance));
    setCoOrdinates(cords);
  }

  function setZoom(distance) {
    if (distance < 8) return 7;
    if (distance < 16) return 6;
    if (distance < 24) return 5;
    if (distance < 32) return 4;
    if (distance < 48) return 3;
    return 2;
  }

  function getFlyerDetails() {
    if (currentFlyerId !== 0) {
      const filteredList = flyersList.filter((item) => item.flyerId === currentFlyerId);
      const flyerDetail =
        filteredList[0].startLocation + "-" + filteredList[0].destLocation + "(" + filteredList[0].flyerId + ")";
      return flyerDetail;
    }
  }

  function calculateTotalCost(totalParceWeight) {
    setParcelWeight(totalParceWeight);
    if (currentFlyerId !== 0) {
      const filteredList = flyersList.filter((item) => item.flyerId === currentFlyerId);
      const price = Moralis.Units.FromWei(filteredList[0].pricePerKg);
      const finalCost = totalParceWeight * price;
      setTotalParcelCost(finalCost);
    }
  }

  return (
    <>
      <div style={{ width: "600px", margin: "auto" }}>
        <Modal
          title="Add Flyer Details"
          visible={visibleAddFlyer}
          onCancel={() => setVisibleAddFlyer(false)}
          onOk={() => addFlyer()}
          okText="Add Flyer"
        >
          <Spin spinning={loading}>
            <div style={{ padding: "10px 0 10px 0" }}>
              Flyer Address{" "}
              <Input
                placeholder="Flyer Address"
                name="flyerAddress"
                //onChange={(event) => setFlyerAddress(event.target.value)}
                style={{ width: "75%" }}
                value={walletAddress}
                disabled={true}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Origin Location:{" "}
              <Input
                placeholder="Origin Location"
                name="origin"
                style={{ width: "75%" }}
                onChange={(event) => setFlyerOrigin(event.target.value)}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Origin Coordinate:{" "}
              <Input
                placeholder="Origin Coordinate"
                name="originCoordinate"
                style={{ width: "75%" }}
                onChange={(event) => setFlyerOriginCoordinate(event.target.value)}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Destination Location:{" "}
              <Input
                placeholder="Destination Location"
                name="destinationLocation"
                style={{ width: "70%" }}
                onChange={(event) => setFlyerDestination(event.target.value)}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Destination Coordinate:{" "}
              <Input
                placeholder="Destination Coordinate"
                name="destinationCoordinate"
                style={{ width: "65%" }}
                onChange={(event) => setFlyerDestCoordinate(event.target.value)}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Allowed Weight in kg:{" "}
              <Input
                placeholder="Allowed Weight in kg"
                name="weightAllowed"
                onChange={(event) => setWeightAllowed(event.target.value)}
                style={{ width: "20%" }}
                type="number"
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Price Per kg:{" "}
              <Input
                placeholder="Price Per Kg"
                name="pricePerKg"
                onChange={(event) => setPricePerKg(event.target.value)}
                style={{ width: "20%" }}
                type="number"
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Phone:{" "}
              <Input
                placeholder="Phone (Passed only for the committed customers)"
                name="phone"
                style={{ width: "75%" }}
                onChange={(event) => setFlyerPhone(event.target.value)}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Date Of Travel:{" "}
              <Input
                id="dateOfTravel"
                placeholder="Date Of Travel (dd-mmm-yyyy"
                style={{ width: "40%" }}
                onChange={(event) => setDateOfTravel(event.target.value)}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              specification:{" "}
              <Input
                placeholder="Specification (if any)"
                name="specification"
                style={{ width: "75%" }}
                onChange={(event) => setSpecification(event.target.value)}
              />
            </div>
          </Spin>
        </Modal>
      </div>
      <div>
        <Modal
          title="Add Parcel Details"
          visible={visibleAddParcel}
          onCancel={() => setVisibleAddParcel(false)}
          onOk={() => sendParcel()}
          okText="Send Parcel"
        >
          <Spin spinning={loading}>
            <div style={{ padding: "10px 0 10px 0" }}>
              Flyer Details:{" "}
              <Input
                label="Flyer Details"
                name="flyerDetails"
                style={{ width: "75%" }}
                disabled={true}
                value={getFlyerDetails()}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Sender Address:{" "}
              <Input
                placeholder="Sender Address"
                name="senderAddress"
                //onChange={(event) => setSenderAddress(event.target.value)}
                style={{ width: "75%" }}
                value={walletAddress}
                disabled={true}
              />
            </div>

            <div style={{ padding: "10px 0 10px 0" }}>
              Parcel Weight:{" "}
              <Input
                placeholder="Parcel Weight"
                name="parcelWeight"
                onChange={(event) => calculateTotalCost(event.target.value)}
                style={{ width: "30%" }}
                type="number"
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Total Cost (MATIC):{" "}
              <Input
                placeholder="Total Cost (MATIC)"
                name="totalCost"
                value={totalParcelCost}
                disabled={true}
                style={{ width: "70%" }}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Customer Phone:{" "}
              <Input
                placeholder="Customer Phone"
                name="customerPhone"
                onChange={(event) => setCustomerPhone(event.target.value)}
                style={{ width: "75%" }}
              />
            </div>
            <div style={{ padding: "10px 0 10px 0" }}>
              Parcel Detail:{" "}
              <Input
                placeholder="Parcel Detail"
                name="parcelDetail"
                onChange={(event) => setParcelDetail(event.target.value)}
                style={{ width: "75%" }}
              />
            </div>
          </Spin>
        </Modal>
      </div>
      <div className="rentalsContent">
        <div className="rentalsContentL">
          <div className="flyerTitleRow">
            Flyers Available For Parcel Delivery
            <Button type="primary" onClick={() => setVisibleAddFlyer(true)}>
              Add Flyer
            </Button>
          </div>
          {flyersList &&
            flyersList.map((e, i) => {
              return (
                <>
                  <hr className="line2" />
                  <div className={i === 0 ? "rentalDivH" : "rentalDiv"}>
                    <div className="rentalInfo">
                      <div className="rentalTitle">
                        {e.startLocation} - {e.destLocation}
                      </div>
                      <div className="rentalDesc">Max Weight: {e.weightAllowed}</div>
                      <div className="rentalDesc">Price / kg: {Moralis.Units.FromWei(e.pricePerKg)} MATIC</div>
                      <div className="rentalDesc">Date Of Travel: {e.dateOfTravel}</div>
                      <div className="rentalDesc">Specification: {e.anySpecification}</div>
                      <div className="bottomButton">
                        <Button
                          type="primary"
                          onClick={() => {
                            setLocation(e);
                          }}
                        >
                          Show On Map
                        </Button>
                        {e.flyerAddress.toLowerCase() !== walletAddress.toLowerCase() && (
                          <Button
                            type="primary"
                            onClick={() => {
                              setLocation(e);
                              setcurrentFlyerId(e.flyerId);
                              setVisibleAddParcel(true);
                            }}
                          >
                            Send Parcel
                          </Button>
                        )}
                        <div className="price"> {Moralis.Units.FromWei(e.pricePerKg)} / kg MATIC</div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
        </div>
        <div className="rentalsContentR">
          <RentalsMap locations={coOrdinates} mapZoom={mapZoom} />
        </div>
      </div>
    </>
  );
};

export default Flyers;
