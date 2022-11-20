import React, { useState, useEffect } from "react";
import { Dropdown, Tab, Nav, Button, Modal, Container } from "react-bootstrap";
import { Link, useSearchParams, useLocation } from "react-router-dom";

import NftCard from "./NftCard";

require("dotenv").config();

export default function NftCollection() {

    const API_ISSUER_URL = "https://api.xrpldata.com/api/v1/xls20-nfts/issuer/"

    const [numberOfNfts, setNumberOfNfts] = useState(0);
    const [nftImages, setNftImages] = useState([]);
    const [nftNames, setNftNames] = useState([]);
    const [owners, setOwners] = useState([]);
    
    function convertHexToStr(hex) {
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    async function getNftImage(id) {
            console.log("on the dex api")
            let onTheDex = `https://marketplace-api.onxrp.com/api/metadata/${id}`;
            let imageUrl = `https://marketplace-api.onxrp.com/api/image/${id}`;
            let response = await fetch(onTheDex);
            let data = await response.json();
            let name = data.name;
            return {image: imageUrl, name: name};
        }

    async function getNftImages(batch){
        //make requests in parallel
        let promises = batch.map(async (id) => {
            return await getNftImage(id);
        });
        let results = await Promise.all(promises);
        return results;
    }

    async function getNfts(issuerId) {
        let url = API_ISSUER_URL + issuerId;
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data);
        data = data[issuerId];
        let counter = 0;
        let imgs = [];
        let nms = [];
        let owners = [];
        let batch = [];
        for (let i in data){
            // console.log(data[i]);
            let nftId = data[i].NFTokenID;
            owners.push(data[i].Owner);
            // let nftImage = await getNftImage(nftId);
            batch.push(nftId);
            //if the batch has 20 nfts, get the images
            if (batch.length === 500){
                let nftImages = await getNftImages(batch);
                // console.log(nftImages);
                for (let j in nftImages){
                    imgs.push(nftImages[j].image);
                    nms.push(nftImages[j].name);
                }
                batch = [];
            }
            // console.log(nftImage);
            counter++;
        }
        setNumberOfNfts(counter);
        setNftImages(imgs);
        setNftNames(nms);
        setOwners(owners);
    }

    useEffect(() => {
        getNfts("rNPEjBY4wcHyccfWjDpuAgpxk8S2itLNiH")
    }, []);

    return (
        <div className="content-body">

            <div className="container-fluid">

                <div className="row">
                    <div className="col-lg-12">
                        <div className="collection-info-area">
                            <div className="bg-area mb-3"  style={{ backgroundImage: `url(./images/test/banner.jpg)` }}>
                                <div className="avatar-area">
                                     <img src="./images/avatar/standard-collection.gif" alt="" className="avatar-img" />
                                </div>
                            </div>
                            <div className="info-area">
                                <div className="left">
                                    <h2 class="text-white">Houndies</h2>-
                                    <span>Created by <a className="text-white">rpZidWw84xGD3dp7F81ajM36NZnJFLpSZW</a></span>
                                    <span>Houndies is a collection of 10,000 greyhound avatar NFTs living on the XRPL. Inspired by street art and contemporary design, the collection was crafted by one artist with a singular vision.. Each piece of original digital art has its own personality and a unique combination of attributes from a pool of over 200 traits. </span>
                                </div>
                                <div className="right">
                                    <div className="info-box">
                                        <div>
                                            <span>Price Floor</span>
                                            <span className="text-white">0 XRP</span>
                                        </div>
                                        <div>
                                            <span>Volume</span>
                                            <span className="text-white">0 XRP</span>
                                        </div>
                                        <div>
                                            <span>Owners</span>
                                            <span className="text-white">5</span>
                                        </div>
                                        <div>
                                            <span>Items</span>
                                            <span className="text-white">{numberOfNfts}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="row">
                    <div className="col-lg-12">
                        <form className="nft-form">
                            <input type="text" className="form-control search" placeholder="Search NFT's" />
                            
                            <div className="dropdown d-block">
                                <div className="btn d-flex " data-toggle="dropdown" aria-expanded="false">
                                    <div className="text-left">
                                        <span className="d-block fs-15 text-white">Trending</span>
                                    </div>
                                    <i className="fa fa-angle-down ml-3 text-white" />
                                </div>
                                <div className="dropdown-menu dropdown-menu-right" x-placement="bottom-end" style={{ position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(-37px, 72px, 0px)' }}>
                                    <a className="dropdown-item" href="">Recently listed</a>
                                    <a className="dropdown-item" href="">Price: low to high</a>
                                    <a className="dropdown-item" href="">Price: high to low</a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="explore-container">
                            {Array(numberOfNfts).fill().map((_, i) => (
                                nftImages[i] === "" || nftImages[i] === undefined ? null : <NftCard key={i} nft={nftImages[i]} name={nftNames[i]} address={owners[i]} />
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};