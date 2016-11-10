function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = "Hello World from " + name;
}

showHello("greeting", "TypeScript!");