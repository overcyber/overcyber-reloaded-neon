
import os
import shutil
import subprocess
from pathlib import Path

def main():
    print("Iniciando processo de build...")

    # Executar o build do React
    print("Executando npm run build...")
    subprocess.run(["npm", "run", "build"], check=True)
    
    build_dir = Path("dist")
    if not build_dir.exists():
        print("Erro: O build não foi gerado corretamente!")
        return

    print(f"Build concluído com sucesso! Arquivos disponíveis em: {build_dir.absolute()}")
    print("\nPara iniciar o servidor Python, execute:")
    print("python server.py")

if __name__ == "__main__":
    main()
