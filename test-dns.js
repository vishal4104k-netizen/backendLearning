import dns from "dns";

dns.setServers(["8.8.8.8"]);

dns.promises.resolveSrv(
    "_mongodb._tcp.vishal01.kn5fjki.mongodb.net"
)
.then(result => {
    console.log("SRV RESULT:");
    console.log(result);
})
.catch(error => {
    console.error("DNS ERROR:");
    console.error(error);
});