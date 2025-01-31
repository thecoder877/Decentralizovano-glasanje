import { CONTRACT_ADDRESS } from '../config.js';

document.addEventListener("DOMContentLoaded", async () => {
    async function initWeb3() {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                return web3;
            } catch (error) {
                console.error("Korisnik odbio pristup nalogu");
            }
        } else if (window.web3) {
            return new Web3(window.web3.currentProvider);
        } else {
            console.error("Web3 provider nije detektovan");
        }
    }

    async function initContract(web3) {
        const response = await fetch('../build/contracts/Voting.json'); // putanja do ugovora
        const data = await response.json();
        const contract = new web3.eth.Contract(data.abi, CONTRACT_ADDRESS); // Adresa ugovora
        return contract;
    }

    const web3 = await initWeb3();
    if (!web3) {
        alert("MetaMask nije povezan! Povezi se sa Ganache mrezom.");
        return;
    }

    const contract = await initContract(web3);
    const accounts = await web3.eth.getAccounts();

    // Prikazi kandidate
    const candidatesList = document.getElementById("candidates");
    const candidatesCount = await contract.methods.candidatesCount().call();

    for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await contract.methods.candidates(i).call();
        const li = document.createElement("li");
        li.className = "candidate-card";
        li.innerHTML = `
            <img src="/images/chain.png" alt="Candidate Photo">
            <h3>ID: ${candidate.id}</h3>
            <p>${candidate.name}</p>
            <p>Glasovi: <b>${candidate.voteCount}</b></p>
            
        `;
        candidatesList.appendChild(li);
    }

    // Glasanje
    const voteForm = document.getElementById("voteForm");
    voteForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const candidateId = document.getElementById("candidateId").value;
        try {
            await contract.methods.vote(candidateId).send({ from: accounts[0] });
            alert("Uspešno ste glasali!");
            location.reload(); // osvezavanje stranice nakon uspesnog glasanja
        } catch (error) {
            console.error(error);
            if (error.message.includes("Vec ste glasali!")) {
                alert("Već ste glasali!");
            } else if (error.message.includes("Nevalidan kandidat!")) {
                alert("Nevalidan kandidat!");
            } else if (error.message.includes("Internal JSON-RPC error")) {
                alert("Došlo je do greške prilikom glasanja. Proverite da li ste već glasali ili da li je kandidat validan.");
            } else {
                alert("Došlo je do greške prilikom glasanja.");
            }
        }
    });
});