function extrairParametroFaceId(textoCompleto, chaveDesejada) {
    // Divide o texto completo em pares chave=valor
    const parametros = textoCompleto.split("&");

    // Itera sobre os pares de parâmetros
    for (let parametro of parametros) {
        // Divide o par no formato chave=valor
        let [chave, valor] = parametro.split("=");

        // Verifica se a chave é a que estamos buscando
        if (chave === chaveDesejada) {
            console.log(valor); // Depuração: exibe o valor encontrado (opcional)
            return valor; // Retorna o valor associado à chave
        }
    }

    // Retorna null caso o parâmetro não seja encontrado
    return null;
}

// Exporta a função
module.exports = extrairParametroFaceId;
