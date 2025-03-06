# secure_serving/config.py
ENCRYPTION_PROTOCOLS = {
    'model_weights': 'homomorphic',
    'inference_input': 'secure-sgx',
    'feature_store': 'zero-knowledge'
}

RUNTIME_PROTECTIONS = [
    'model-watermarking',
    'api-shield',
    'runtime-attestation'
]