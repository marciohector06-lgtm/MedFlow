export const calcularRegrasIdade = (dataNascimento) => {
  if (!dataNascimento) return { precisaResponsavel: false, ehMenor: false };

  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  
  const ehMenor = idade < 18;
  const ehIdoso = idade >= 60;
  
  return {
    precisaResponsavel: ehMenor || ehIdoso,
    ehMenor: ehMenor
  };
}