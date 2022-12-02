import React, { useState, useEffect } from "react";
import { Dropdown, Tab, Nav, Button, Modal, Container } from "react-bootstrap";
import { Link, useSearchParams, useLocation } from "react-router-dom";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

require("dotenv").config();

export default function NftDetails(props) {

    const [nftImage, setNftImage] = useState("");
    const [nftName, setNftName] = useState("");
    const [owner, setOwner] = useState("");
    const [nftId, setNftId] = useState("");
    const [nftAttrs, setNftAttrs] = useState([]);
    const [setDesc, setSetDesc] = useState("");
    const [setCollection, setSetCollection] = useState("");
    const [collectionId, setCollectionId] = useState("");

    const { search } = useLocation();
    const match = search.match(/nftid=(.*)/);
    const type = match?.[1];
    // console.log(type);
  
    async function getOwner(id) {
        let url = 'https://api.xrpldata.com/api/v1/xls20-nfts/nft/' + id;
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data);
        setCollectionId("/nftCollection?collectionId=" + data.nft.Issuer)
        return data.nft.Owner;
    }

    async function getNftImageAndMeta(id) {
        console.log("on the dex api")
        let onTheDex = `https://marketplace-api.onxrp.com/api/metadata/${id}`;
        let imageUrl = `https://marketplace-api.onxrp.com/api/image/${id}`;
        let response = await fetch(onTheDex);
        let data = await response.json();
        let name = data.name;
        let attr = data.attributes;
        let collection = data.collection.name;
        let desc = data.collection.description;
        let owner = await getOwner(id);
        setOwner(owner);
        setNftAttrs(attr);
        setNftId(id);
        setNftName(name);
        setNftImage(imageUrl); 
        setSetCollection(collection);    
        setSetDesc(desc);   
        return {image: imageUrl, name: name, attr: attr, owner: owner};
    }

    useEffect(() => {
        getNftImageAndMeta(type);
    }, []);


    return (
        <div className="content-body">
            <div className="container-fluid">

                <div className="page-titles">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="/nftExplore">NFTs</a></li>
                        <li className="breadcrumb-item"><a href={collectionId}>{setCollection}</a></li>
                        <li className="breadcrumb-item active"><a href="">{nftName}</a></li>
                    </ol>
                </div>

                <div className="single-nft">

                    <div className="row">

                        <div className="col-xl-6 col-xxl-6 col-lg-6 col-md-12 ">
                            <div className="nft-container">
                                <div className="img-wrapper  mb-5">
                                    <img className="img-fluid" src= {nftImage} />
                                </div>
                                <div className="mb-5">
                                    <h3 class="mb-3">Owned by</h3>
                                    <div class="owner-nft">
                                        <div class="owner-avatar">
                                            <a href="#">
                                                <img src="/images/avatar/default-avatar.jpg" alt="Profile Image"/>
                                            </a>
                                            <div class="profile-verification verified">
                                                <i class="fas fa-check"></i>
                                            </div>
                                        </div>
                                        <div class="owner-info">
                                            <span class="username">RandomUser123</span>
                                            <h6 class="address"> {owner || <Skeleton width={300}/>} </h6>
                                        </div>
                                    </div>
                                </div>
                                <h3 class="mb-3">Attributes</h3>
                                <div className="box properties mb-3">
                                    <div className="properties-wrapper">
                                        {/* <div class="single-prop"><span>Dragon </span><p>Gold</p></div> */}
                                        {nftAttrs.map((attr, index) => {
                                            return (
                                                <div class="single-prop"><span>{attr.trait_type} </span><p>{attr.value}</p></div>
                                            )
                                        })}

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-6 col-xxl-6 col-lg-6 col-md-12 ml-auto ">
                            <div className="sticky-info">
                                <div className="nft-info ">
                                    <div className="d-flex align-items-center mb-3">
                                        <img src="./images/avatar/standard-collection.gif" alt="" className="avatar-img" />
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 text-white">{setCollection || <Skeleton width={100} />}</h5>
                                        </div>
                                    </div>
                                    <div class="nft-name">
                                        <h2 className="mb-3 text-white">{nftName || <Skeleton width={300} />} </h2>
                                    </div>
                                    <p className="mb-3">{setDesc || <Skeleton count={3} />}</p>
                                </div>

                                <div class="nft-price-wrapper">
                                    <div>
                                        <div className="box-info">
                                            <p className="fs-14 mb-0">Price</p>
                                            <div className="nft-item-price"><span>589 XRP</span>≈ 500,000,000 HOUND</div>
                                        </div>
                                        <div className="box-info">
                                            <p className="fs-14 mb-0">Rarity Score</p>
                                            <div className="nft-item-price"><span>273</span>Elite</div>
                                        </div>
                                        </div>
                                        <div className="buy-nft">
                                            <button class="btn buy">Mint for 589 XRP</button>
                                            <button class="btn save-nft"><i class="fa-solid fa-heart"></i></button>
                                        </div>
                                    
                                </div>
                            </div>

                       
                        </div>

                    </div>
                </div>



            </div>
        </div>
    );
};