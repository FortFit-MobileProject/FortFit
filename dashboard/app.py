import json
from collections import Counter
from datetime import date

import streamlit as st


def inteiro_nao_negativo(valor):
    return type(valor) is int and valor >= 0


def carregar_dados(arquivo):
    dados = json.load(arquivo)
    if dados["versao"] != 1 or dados["moeda"] != "BRL":
        raise ValueError("Formato incompatível")
    if not isinstance(dados["pedidos"], list) or not isinstance(dados["produtos"], list):
        raise ValueError("Listas de pedidos e produtos esperadas")
    for pedido in dados["pedidos"]:
        pedido["data"] = date.fromisoformat(pedido["data"])
        if not inteiro_nao_negativo(pedido["totalCentavos"]) or not isinstance(pedido["itens"], list):
            raise ValueError("Pedido inválido")
        for item in pedido["itens"]:
            if not isinstance(item["nome"], str) or not inteiro_nao_negativo(item["quantidade"]):
                raise ValueError("Item inválido")
    for produto in dados["produtos"]:
        if not isinstance(produto["nome"], str) or not inteiro_nao_negativo(produto["estoque"]):
            raise ValueError("Produto inválido")
    return dados["pedidos"], dados["produtos"]


def reais(centavos):
    valor = f"{centavos / 100:,.2f}".translate(str.maketrans(",.", ".,"))
    return f"R$ {valor}"


def main():
    st.set_page_config(page_title="FortFit | Dashboard de vendas", layout="wide")
    st.title("FortFit | Dashboard de vendas")
    arquivo = st.file_uploader("Carregue o JSON exportado no Painel de Vendas", type="json")
    if arquivo is None:
        return

    try:
        pedidos, produtos = carregar_dados(arquivo)
    except (ValueError, KeyError, TypeError, RecursionError):
        st.error("Arquivo inválido. Selecione um JSON exportado pelo FortFit.")
        return

    datas = sorted({pedido["data"] for pedido in pedidos})
    if datas:
        intervalo = st.date_input("Período das vendas", (datas[0], datas[-1]),
                                  min_value=datas[0], max_value=datas[-1])
        if len(intervalo) != 2:
            st.info("Selecione a data inicial e a final.")
            return
        inicio, fim = intervalo
        pedidos = [pedido for pedido in pedidos if inicio <= pedido["data"] <= fim]

    faturamento = sum(pedido["totalCentavos"] for pedido in pedidos)
    receita_por_dia = Counter()
    unidades_por_produto = Counter()
    for pedido in pedidos:
        receita_por_dia[pedido["data"]] += pedido["totalCentavos"]
        for item in pedido["itens"]:
            unidades_por_produto[item["nome"]] += item["quantidade"]

    colunas = st.columns(3)
    colunas[0].metric("Faturamento", reais(faturamento))
    colunas[1].metric("Pedidos", len(pedidos))
    colunas[2].metric("Ticket médio", reais(faturamento / len(pedidos) if pedidos else 0))

    if pedidos:
        st.subheader("Faturamento por dia")
        st.bar_chart([{"Data": dia, "Faturamento (R$)": centavos / 100}
                      for dia, centavos in sorted(receita_por_dia.items())],
                     x="Data", y="Faturamento (R$)")
        st.subheader("Produtos mais vendidos")
        st.bar_chart([{"Produto": nome, "Unidades": quantidade}
                      for nome, quantidade in unidades_por_produto.most_common(10)],
                     x="Produto", y="Unidades", horizontal=True)
    else:
        st.info("Nenhum pedido no período.")

    st.subheader("Estoque baixo na data da exportação")
    estoque_baixo = sorted((p for p in produtos if p["estoque"] <= 5),
                           key=lambda p: p["estoque"])
    if estoque_baixo:
        st.table([{"Produto": p["nome"], "Unidades em estoque": p["estoque"]}
                  for p in estoque_baixo])
    else:
        st.write("Nenhum produto com estoque baixo.")


if __name__ == "__main__":
    main()
