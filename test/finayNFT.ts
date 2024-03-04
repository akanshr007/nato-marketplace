import { ethers } from "hardhat";
import { BasicMetaTransaction } from './../typechain-types/contracts/Relayer/BasicMetaTransaction';
import { Finay } from './../typechain-types/contracts/finayNFT.sol/Finay';
import { BasicMetaTransaction__factory } from './../typechain-types/factories/contracts/Relayer/BasicMetaTransaction__factory';
import { Finay__factory } from './../typechain-types/factories/contracts/finayNFT.sol/Finay__factory';
const { expect } = require("chai");

import { MarketPlace, MarketPlace__factory } from "../typechain-types";
//import {expandTo18Decimals} from "test/utils/utilities.TransferSingleEvent" ; 

import { expandTo16Decimals, expandTo18Decimals } from './utils/utilities';

describe (" Finay " , function () {
let finay : Finay ;
let marketPlace : MarketPlace; 
let biconomy : BasicMetaTransaction ;
let signers : any ; 
let owner : any ; 
let alice: any;
let bob: any;
let tom: any;
let nick: any;
let harry: any;
let tokenID : any ;






beforeEach(async () => {
    signers = await ethers.getSigners();
    (owner = signers[0]),
      (alice = signers[1]),
      (bob = signers[2]),
      (tom = signers[3]),
      (nick = signers[4]),
      (harry = signers[5]);
 
    let tokenID =  1 ;
    let token_URI = "0Xs4f3" ; 

    finay = await new Finay__factory(owner).deploy();
    marketPlace = await new MarketPlace__factory(owner).deploy();
    biconomy = await new BasicMetaTransaction__factory(owner).deploy();

    await finay.connect(owner).initialize("token_URI" , marketPlace.address , owner.address);
    
   
    await marketPlace.connect(owner).initialize(finay.address , owner.address);

})


 describe("Finay test cases : " ,  function (){

  
  it("it should check if the contract is deployed" , async () =>{

  });


  it("it should be able to mint tokens " ,  async () =>{
     //a￼wait finay.connect(owner).safeMint(alice.address , tokenID, expandTo18Decimals(3), "0xab567");
    await finay.connect(owner).safeMint(alice.address,4, 5, []) ;
    expect(await finay.connect(owner).balanceOf(alice.address , 4)).to.be.equal(5);
    
  });

  // it("Finay : Only owner should be able to call the safe mint function" , async () =>{

  //   await expect(finay.connect(alice).safeMint(alice.address,4, 5, [])).to.be.revertedWith("Ownable: caller is not the owner") ;
    
  // });
 
 
  it("Finay : only superAdmin should  be able to call the safeMint function " , async()=>{
    await expect(finay.connect(bob).safeMint(alice.address,4, 5, [])).to.be.revertedWithCustomError(finay,"notSuperAdmin");

  });

  it("Finay : superAdmin should be able to assign another admin" , async ()=>{
    await finay.connect(owner).assignAdmin(alice.address );
    expect( await finay.connect(owner).isSubAdmin(alice.address)).to.be.true;
  })


  it("Finay : Only superAdmin should be able to assign another admin", async() =>{
    await expect( finay.connect(bob).assignAdmin(alice.address)).to.be.revertedWithCustomError(finay,"notSuperAdmin");
  });

  it("Finay : superAdmin should be able to remove another admin " , async ()=>{
    await finay.connect(owner).assignAdmin(alice.address );
    await finay.connect(owner).removeAdmin(alice.address);
    expect( await finay.connect(owner).isSubAdmin(alice.address)).to.be.false;

  })

  it("Finay : Only superAdmin should be able to remove another admin" , async () =>{
    await expect( finay.connect(bob).removeAdmin(alice.address)).to.be.revertedWithCustomError(finay,"notSuperAdmin");

  });


  

  it("Finay :  superAdmin should be able to update another admin" , async() =>{
    await finay.connect(owner).updateAdmin(bob.address) ;
    expect(await finay.connect(owner).superAdmin()).to.be.equal(bob.address)
  })

  it("Finay: Only superAdmin should be able to update admin " , async () =>{
    await  expect( finay.connect(alice).updateAdmin(bob.address) ).to.be.revertedWithCustomError(finay,"notSuperAdmin");
  })



  it("Lazy Mint : it should be able to mint tokens " ,  async () =>{
    let tokenURI = "TokenURI" ;
    await finay.connect(owner).lazyMint(1 , 4 , owner.address ,  alice.address, 2 , tokenURI);
    expect(await finay.connect(owner).balanceOf(alice.address , 1)) ;
    
  }); 

  it("Lazy Mint :  only superAdmin shoud be able to call the lazt mint function" , async () =>{

    let tokenURI = "TokenURI" ;
    await expect(finay.connect(alice).lazyMint(1 , 4 , owner.address ,  alice.address, 2 , tokenURI)).to.be.revertedWithCustomError(finay,"invalidCaller");
  

  })


  // it("LazyMint : Market Place should be able to call the Lazy Mint function" , async () =>{

  //   let tokenURI = "TokenURI" ;
  //   await expect(finay.connect(marketPlace).lazyMint(1 , 4 , owner.address ,  alice.address, 2 , tokenURI)).to.be.revertedWith("IC");
  // })




  it("support interface : it should return true for supported interface " , async () =>{
    expect(await finay.supportsInterface("0xd9b67a26")).to.be.equal(
      true
    );
  })

  it("support interface : it should return false for incorrect interface "  , async()=>{
    expect(await finay.supportsInterface("0xd9b27a56")).to.be.equal(
      false
    );
  })



  it("it should not initialize the contract again" , async () =>{
  
      await expect(
        finay.initialize(
          "token__URI",
          marketPlace.address,
          owner.address
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    
  });

  it("Market Place : it  should not initialize the contract again "  , async() =>{

    await expect(
      marketPlace.initialize(
        finay.address,
        owner.address
      )
    ).to.be.revertedWith("Initializable: contract is already initialized");

  });



  it("Market Place : It should assign the admin correctly " , async () =>{
    
    await marketPlace.connect(owner).assignAdmin(alice.address);
    expect( await marketPlace.connect(owner).isSubAdmin(alice.address)).to.be.true ;  

  })

  it("Market Place : only superAdmin should be able to assign new admin" , async () =>{

    await expect( marketPlace.connect(bob).assignAdmin(alice.address)).to.be.revertedWithCustomError(marketPlace,"notSuperAdmin");
    

  })


  it(" Market Place : It should remove the assigned admin correctly " , async () =>{
    await marketPlace.connect(owner).removeAdmin(alice.address) ; 
    expect (await marketPlace.connect(owner).isSubAdmin(alice.address)).to.be.false ;


  })


  it("Market Place : only assigned superAdmin shoud be able to remove the other admin" , async ()=>{

    await expect( marketPlace.connect(bob).removeAdmin(alice.address)).to.be.revertedWithCustomError(marketPlace,"notSuperAdmin");
    
  })


  it("Market Place : Admin should be able to buy NFT" , async () =>{
   let tokenURI= "ABC.xyz"
    await marketPlace.connect(owner).buyNFT(owner.address , owner.address  , bob.address , 2 , 5 , 15 , tokenURI , true ) ; 
  });
  
  it("Market Place : admint should be able to udpate admin ++ Updated admint should assign role for another admint" , async() =>{

    await marketPlace.connect(owner).updateAdmin(bob.address) ; 
    await marketPlace.connect(bob).assignAdmin(nick.address);
    expect(await marketPlace.connect(owner).isSubAdmin(nick.address)).to.be.true;

   // expect(await marketPlace.connect(bob).isSubAdmin(owner.address)).to.be.false ;
  });

  it("Market Place : BuyNFT : Seller address should not be address zero"  , async () =>{

    let tokenURI= "ABC.xyz" ;
    await expect(marketPlace.connect(owner).buyNFT(ethers.constants.AddressZero , owner.address  , bob.address , 2 , 5 , 15 , tokenURI , true ))
    .to.be.revertedWithCustomError(marketPlace,"zeroAddress");

  });

  it("Market Place : BuyNFT : Buyer Address should not be address zero" , async () =>{

    let tokenURI= "ABC.xyz" ;
    await expect(marketPlace.connect(owner).buyNFT(owner.address , owner.address ,ethers.constants.AddressZero  ,  2 , 5 , 15 , tokenURI , true ))
    .to.be.revertedWithCustomError(marketPlace,"zeroAddress");

  });


  it("Market Place : BuyNFT : Royalty keeper should not be address zero" , async () =>{
    let tokenURI= "ABC.xyz" ;
    await expect(marketPlace.connect(owner).buyNFT(owner.address , ethers.constants.AddressZero , bob.address  , 2 , 5 , 15 , tokenURI , true ))
    .to.be.revertedWithCustomError(marketPlace,"zeroAddress");

  });

  it("Market Place : BuyNFT : Amount should be greater than O" , async () =>{
    let tokenURI= "ABC.xyz" ;
    await expect(marketPlace.connect(owner).buyNFT(owner.address , owner.address , bob.address  , 2 , 0, 15 , tokenURI , true ))
    .to.be.revertedWithCustomError(marketPlace,"zeroAmount");

  });


  it("Market Place : BuyNFT : it should not called by non-admin" , async() =>{
    let tokenURI= "ABC.xyz" ;
    await expect(marketPlace.connect(nick).buyNFT(owner.address , owner.address , bob.address  , 2 , 0, 15 , tokenURI , true ))
    .to.be.revertedWithCustomError(marketPlace,"notSubAdmin");

    
  });

  it("Market Place : BuyNFT :  Only admin should be able to update admin" , async () =>{
    await  expect(marketPlace.connect(nick).updateAdmin(alice.address)).to.be.revertedWithCustomError(marketPlace,"notSuperAdmin");
  })



  it("Market Place : BuyNFT : Secondary  " , async () =>{
    let tokenURI= "ABC.xyz" ;

    await marketPlace.connect(owner).assignAdmin(nick.address);
    await marketPlace.connect(nick).buyNFT(owner.address ,owner.address , nick.address , 4 ,5 , 15 , tokenURI,true) ; 

    await marketPlace.connect(owner).assignAdmin(alice.address) ; 
    await marketPlace.connect(alice).buyNFT(nick.address , owner.address , alice.address , 4 ,5 , 15, tokenURI , false);

  })


it("Market Place : BuyNFT : Non-admint should not be able to Update Admin" , async () =>{
  await expect (marketPlace.connect(alice).updateAdmin(bob.address)).to.be.revertedWithCustomError(marketPlace,"notSuperAdmin");
})

it("Market Place ; BuyBatchNFT ; Seller address should not be address zero " , async()=>{
  let tokenURI= "ABC.xyz" ;
  let  zeroAddress = ethers.constants.AddressZero
  let value = [zeroAddress]
  let royaltykeeper = [owner.address]
  let tokenId = [1];
  let amount = [1];
  let royaltyFee = [1];
  let tokenUri = ["ddjhdsjhsjdhs"];
  let primary = [true];
  await expect (marketPlace.connect(owner).buyBatchNFT(value, royaltykeeper, bob.address , tokenId, amount, royaltyFee , tokenUri , primary ))
  .to.be.revertedWithCustomError(marketPlace,"zeroAddress");
})

it("Market Place ; BuyBatchNFT ; IDs and Seller array length should be same " , async()=>{
  let tokenURI= "ABC.xyz" ;
  let  zeroAddress = ethers.constants.AddressZero
  let value = [zeroAddress]
  let royaltykeeper = [owner.address]
  let tokenId = [1,3];
  let amount = [1];
  let royaltyFee = [1];
  let tokenUri = ["ddjhdsjhsjdhs"];
  let primary = [true];
  await expect (marketPlace.connect(owner).buyBatchNFT(value, royaltykeeper, bob.address , tokenId, amount, royaltyFee , tokenUri , primary ))
  .to.be.revertedWithCustomError(marketPlace,"unmatchedLength");
})

it("Market Place ; BuyBatchNFT ; Amount and Seller array length should be same " , async()=>{
  let tokenURI= "ABC.xyz" ;
  let  Seller_Address = [owner.address , bob.address]
  let value = [alice.address]
  let royaltykeeper = [owner.address]
  let tokenId = [1,3];
  let amount = [1,2,3];
  let royaltyFee = [1];
  let tokenUri = ["ddjhdsjhsjdhs"];
  let primary = [true];
  await expect(marketPlace.connect(owner).buyBatchNFT(Seller_Address, royaltykeeper, bob.address , tokenId, amount, royaltyFee , tokenUri , primary ))
  .to.be.revertedWithCustomError(marketPlace,"unmatchedLength");
})

it("Market Place : BuyBatchNFT : it should not called by non-admin" , async() =>{
  let tokenURI= "ABC.xyz" ;
  let  zeroAddress = ethers.constants.AddressZero
  let value = [zeroAddress]
  let royaltykeeper = [owner.address]
  let tokenId = [1];
  let amount = [1];
  let royaltyFee = [1];
  let tokenUri = ["ddjhdsjhsjdhs"];
  let primary = [true];
  await expect (marketPlace.connect(alice).buyBatchNFT(value, royaltykeeper, bob.address , tokenId, amount, royaltyFee , tokenUri , primary ))
  .to.be.revertedWithCustomError(marketPlace,"notSubAdmin");
  
});

it("Market Place : BuyNFT :  Only admin should be able to update admin" , async () =>{
  await  expect(marketPlace.connect(nick).updateAdmin(alice.address)).to.be.revertedWithCustomError(marketPlace,"notSuperAdmin");
})


it("Market Place : Amounts, tokenId, and royalty length should be same" , async()=>{

  let tokenURI1= "ab.xyz" ;
  let tokenURI2= "abc.xyt" ;
  
  let seller = [alice.address , tom.address] ; 
  let tokenId = [1,2];   
  let amount = [10,40]; 

  let royaltykeeper = [owner.address]
  let tokenuris = [tokenURI1,tokenURI2];
  
  let royaltyFee = [1];
  
  let primary = [true];

  await expect (marketPlace.connect(owner).buyBatchNFT(seller, royaltykeeper, bob.address , tokenId, amount, royaltyFee , tokenuris , primary ))
  .to.be.revertedWithCustomError(marketPlace,"unmatchedLength");

})


// it("Market Place : BuyNFT : Secondary  " , async () =>{
//   let tokenURI= "ABC.xyz" ;

//   await marketPlace.connect(owner).assignAdmin(nick.address);
//   await marketPlace.connect(nick).buyBatchNFT(owner.address ,owner.address , nick.address , 4 ,5 , 15 , tokenURI,true) ; 

//   await marketPlace.connect(owner).assignAdmin(alice.address) ; 
//   await marketPlace.connect(alice).buyBatchNFT(nick.address , owner.address , alice.address , 4 ,5 , 15, tokenURI , false);

// })

 })
})






//owner -> update admin (bob) -> assignadmin(nick) , now both owner and bob are admins