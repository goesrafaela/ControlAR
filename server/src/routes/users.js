router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const resultado = await autenticarUsuario(email, senha);

  if (!resultado.valido) {
    return res.status(resultado.status).json({
      success: false,
      message: resultado.mensagem
    });
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login realizado com sucesso!",
    data: resultado.usuario
  });
});