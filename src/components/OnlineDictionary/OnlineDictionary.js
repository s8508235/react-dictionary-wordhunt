

import React, { useState, useEffect } from "react";
import {
    Link,
    // Switch as RouteSwitch,
    // Route
}
from "react-router-dom";

import { Container, Switch, withStyles, Button } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

import { useAuth } from '../Auth/Auth';
import Definitions from "../Definitions/Definitions";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";


function OnlineDictionary() {
    const [word, setWord] = useState("");
    const [meanings, setMeanings] = useState([]);
    const [category, setCategory] = useState("en");
    const [LightTheme, setLightTheme] = useState(false);

    const auth = useAuth();
    const PurpleSwitch = withStyles({
        switchBase: {
            color: grey[50],
            "&$checked": {
                color: grey[900],
            },
            "&$checked + $track": {
                backgroundColor: grey[500],
            },
        },
        checked: {},
        track: {},
    })(Switch);

    const dictionaryApi = async () => {
        try {
            const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${category}/${word}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',
            })
            setMeanings(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    console.log(meanings);

    useEffect(() => {
        if (word && category) {
            dictionaryApi();
        }
        // eslint-disable-next-line
    }, [word, category]);

    return (

        <div
            className="App"
            style={{
                height: "100vh",
                backgroundColor: LightTheme ? "#fff" : "#282c34",
                color: LightTheme ? "black" : "white",
                transition: "all 0.5s linear",
            }}
        >
            <Container
                maxWidth="md"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    justifyContent: "space-evenly",
                }}
            >
                <div>{auth.user && <Button variant="outlined" color="primary" onClick={async (e) => {
                    await auth.signOut(() => console.log("log out"))
                    }}>Log out</Button>}</div>
                <div
                    style={{ position: "absolute", top: 10, right: 250, paddingTop: 10 }}
                >
                    <Link to="/protected">User dictionary Page</Link>
                </div>
                <div
                    style={{ position: "absolute", top: 0, right: 15, paddingTop: 10 }}
                >
                    <span>{LightTheme ? "Dark" : "Light"} Mode</span>
                    <PurpleSwitch
                        checked={LightTheme}
                        onChange={() => setLightTheme(!LightTheme)}
                    />
                </div>
                <Header
                    setWord={setWord}
                    category={category}
                    setCategory={setCategory}
                    word={word}
                    setMeanings={setMeanings}
                    LightTheme={LightTheme}
                />
                {meanings && (
                    <Definitions
                        meanings={meanings}
                        word={word}
                        LightTheme={LightTheme}
                        category={category}
                    />
                )}
            </Container>
            <Footer />
        </div>
    )
}

export default OnlineDictionary;
