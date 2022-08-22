import React, { useState, useEffect } from "react";
import { Glovery } from "helpers/Glovery.js"
import Text from "antd/lib/typography/Text";
import heros from "../image/Glovery.png"

const styles = {
  content: {
    display: "flex",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",
    marginTop: "130px",
    padding: "10px",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
    padding: "0 10px",
    boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
  text: {
    gap: "10px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
    justifyContent: "center"
  },
};

function Home ({ inputValue, setInputValue }) {
  return (
    <>
      <div style={styles.banner}>
        <Text>
          <div style={styles.text}>
            <br/>
            {Glovery[0].title}
            <br/><br/>
            <img src={heros} width="480" height="280"/>
            <br />
            <br />
            {Glovery[0].companyObjective}
            <br />
            <br />
            <b>How It Works: </b>
            {Glovery[0].how}
            <br />
            <br />
            <b>{Glovery[0].details}</b>
            <br/>
            <br/>
            &copy; GLOVERY
          </div>
        </Text>
      </div>
    </>
  );
}

export default Home;
